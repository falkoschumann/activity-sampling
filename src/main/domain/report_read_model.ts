// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ReportEntry,
  type ReportQuery,
  ReportQueryResult,
  ReportScope,
} from "../../shared/domain/report_query";
import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";
import { ActivityLoggedEvent } from "./activity_logged_event";

export type ReportReadModel = {
  activities: Activity[];
  categories: string[];
};

export type Activity = {
  readonly start: Temporal.Instant;
  readonly finish: Temporal.Instant;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;
};

export const initialReportReadModel: ReportReadModel = {
  activities: [],
  categories: [],
};

export function projectReport(
  readModel = initialReportReadModel,
  event: ActivityLoggedEvent,
): ReportReadModel {
  const activities = projectActivities(readModel.activities, event);
  const categories = projectCategories(readModel.categories, event);
  return { activities, categories };
}

export function queryReport(
  readModel = initialReportReadModel,
  query: ReportQuery,
): ReportQueryResult {
  const entries = createEntries(readModel.activities, query);
  const totalHours = sumTotalHours(entries);
  return ReportQueryResult.create({ entries, totalHours });
}

function projectActivities(activities: Activity[], event: ActivityLoggedEvent) {
  const index = activities.findIndex(
    (activity) =>
      activity.client === event.client &&
      activity.project === event.project &&
      activity.task === event.task &&
      activity.category == event.category,
  );
  if (index == -1) {
    const newActivity = {
      start: event.timestamp,
      finish: event.timestamp,
      client: event.client,
      project: event.project,
      task: event.task,
      category: event.category,
      hours: event.duration,
    };
    activities = [...activities, newActivity];
  } else {
    let existingActivity = activities[index]!;
    const start =
      Temporal.Instant.compare(event.timestamp, existingActivity.start) < 0
        ? event.timestamp
        : existingActivity.start;
    const finish =
      Temporal.Instant.compare(event.timestamp, existingActivity.finish) > 0
        ? event.timestamp
        : existingActivity.finish;
    existingActivity = {
      ...existingActivity,
      start,
      finish,
      hours: normalizeDuration(existingActivity.hours.add(event.duration)),
    };
    activities = activities.toSpliced(index, 1, existingActivity);
  }
  return activities;
}

function projectCategories(categories: string[], event: ActivityLoggedEvent) {
  if (event.category != null && !categories.includes(event.category)) {
    categories = [...categories, event.category];
    categories.sort();
  }
  return categories;
}

function createEntries(activities: Activity[], query: ReportQuery) {
  switch (query.scope) {
    case ReportScope.CLIENTS:
      return createClientsReport(activities, query);
    case ReportScope.PROJECTS:
      return createProjectsReport(activities, query);
    case ReportScope.TASKS:
      return createTasksReport(activities, query);
    case ReportScope.CATEGORIES:
      return createCategoriesReport(activities, query);
  }
}

function createClientsReport(activities: Activity[], query: ReportQuery) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateClientsReport(entries, activity, query);
  }
  entries.sort(compareClientsReport);
  return entries;
}

function updateClientsReport(
  entries: ReportEntry[],
  activity: Activity,
  query: ReportQuery,
) {
  if (
    !isTimestampInPeriod(activity.start, query.timeZone, query.from, query.to)
  ) {
    return;
  }

  let start = activity.start.toZonedDateTimeISO(query.timeZone).toPlainDate();
  let finish = activity.finish.toZonedDateTimeISO(query.timeZone).toPlainDate();
  const index = entries.findIndex((entry) => entry.client === activity.client);
  if (index == -1) {
    entries.push(
      ReportEntry.create({
        start,
        finish,
        client: activity.client,
        hours: activity.hours,
        cycleTime: finish.since(start).total("days") + 1,
      }),
    );
  } else {
    const entry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, entry.start) < 0 ? start : entry.start;
    finish =
      Temporal.PlainDate.compare(finish, entry.finish) > 0
        ? finish
        : entry.finish;
    entries[index] = ReportEntry.create({
      start,
      finish,
      client: activity.client,
      hours: normalizeDuration(activity.hours.add(entry.hours)),
      cycleTime: finish.since(start).total("days") + 1,
    });
  }
}

function compareClientsReport(a: ReportEntry, b: ReportEntry) {
  return a.client.localeCompare(b.client);
}

function createProjectsReport(activities: Activity[], query: ReportQuery) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateProjectsReport(entries, activity, query);
  }
  entries.sort(compareProjectsReport);
  return entries;
}

function updateProjectsReport(
  entries: ReportEntry[],
  activity: Activity,
  query: ReportQuery,
) {
  if (
    !isTimestampInPeriod(activity.start, query.timeZone, query.from, query.to)
  ) {
    return;
  }

  let start = activity.start.toZonedDateTimeISO(query.timeZone).toPlainDate();
  let finish = activity.finish.toZonedDateTimeISO(query.timeZone).toPlainDate();
  const index = entries.findIndex(
    (entry) => entry.project === activity.project,
  );
  if (index == -1) {
    entries.push(
      ReportEntry.create({
        start,
        finish,
        client: activity.client,
        project: activity.project,
        hours: activity.hours,
        cycleTime: finish.since(start).total("days") + 1,
      }),
    );
  } else {
    const entry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, entry.start) < 0 ? start : entry.start;
    finish =
      Temporal.PlainDate.compare(finish, entry.finish) > 0
        ? finish
        : entry.finish;
    let client = entry.client;
    if (!entry.client.includes(activity.client)) {
      const clients = client.split(", ");
      clients.push(activity.client);
      clients.sort();
      client = clients.join(", ");
    }
    entries[index] = ReportEntry.create({
      start,
      finish,
      client,
      project: activity.project,
      hours: normalizeDuration(activity.hours.add(entry.hours)),
      cycleTime: finish.since(start).total("days") + 1,
    });
  }
}

function compareProjectsReport(a: ReportEntry, b: ReportEntry) {
  return a.project.localeCompare(b.project);
}

function createTasksReport(activities: Activity[], query: ReportQuery) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateTasksReport(entries, activity, query);
  }
  entries.sort(compareTasksReport);
  return entries;
}

function updateTasksReport(
  entries: ReportEntry[],
  activity: Activity,
  query: ReportQuery,
) {
  if (
    !isTimestampInPeriod(activity.start, query.timeZone, query.from, query.to)
  ) {
    return;
  }

  let start = activity.start.toZonedDateTimeISO(query.timeZone).toPlainDate();
  let finish = activity.finish.toZonedDateTimeISO(query.timeZone).toPlainDate();
  const index = entries.findIndex(
    (entry) =>
      entry.task === activity.task &&
      entry.project === activity.project &&
      entry.client === activity.client,
  );
  if (index == -1) {
    entries.push(
      ReportEntry.create({
        start,
        finish,
        client: activity.client,
        project: activity.project,
        task: activity.task,
        category: activity.category,
        hours: activity.hours,
        cycleTime: finish.since(start).total("days") + 1,
      }),
    );
  } else {
    const entry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, entry.start) < 0 ? start : entry.start;
    finish =
      Temporal.PlainDate.compare(finish, entry.finish) > 0
        ? finish
        : entry.finish;
    let category = entry.category;
    if (
      entry.category != null &&
      activity.category != null &&
      !entry.category.includes(activity.category)
    ) {
      const categories = category.split(", ");
      categories.push(activity.category);
      categories.sort();
      category = categories.join(", ");
    }
    entries[index] = ReportEntry.create({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      category,
      hours: normalizeDuration(activity.hours.add(entry.hours)),
      cycleTime: finish.since(start).total("days") + 1,
    });
  }
}

function compareTasksReport(a: ReportEntry, b: ReportEntry) {
  const taskComparison = a.task.localeCompare(b.task);
  if (taskComparison !== 0) {
    return taskComparison;
  }

  const projectComparison = a.project.localeCompare(b.project);
  if (projectComparison !== 0) {
    return projectComparison;
  }

  return a.client.localeCompare(b.client);
}

function createCategoriesReport(activities: Activity[], query: ReportQuery) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateCategoriesReport(entries, activity, query);
  }
  entries.sort(compareCategoriesReport);
  return entries;
}

function updateCategoriesReport(
  entries: ReportEntry[],
  activity: Activity,
  query: ReportQuery,
) {
  if (
    !isTimestampInPeriod(activity.start, query.timeZone, query.from, query.to)
  ) {
    return;
  }

  let start = activity.start.toZonedDateTimeISO(query.timeZone).toPlainDate();
  let finish = activity.finish.toZonedDateTimeISO(query.timeZone).toPlainDate();
  const index = entries.findIndex(
    (entry) => entry.category === (activity.category ?? "N/A"),
  );
  if (index == -1) {
    entries.push(
      ReportEntry.create({
        start,
        finish,
        category: activity.category,
        hours: activity.hours,
        cycleTime: finish.since(start).total("days") + 1,
      }),
    );
  } else {
    const entry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, entry.start) < 0 ? start : entry.start;
    finish =
      Temporal.PlainDate.compare(finish, entry.finish) > 0
        ? finish
        : entry.finish;
    entries[index] = ReportEntry.create({
      start,
      finish,
      category: activity.category,
      hours: normalizeDuration(activity.hours.add(entry.hours)),
      cycleTime: finish.since(start).total("days") + 1,
    });
  }
}

function compareCategoriesReport(a: ReportEntry, b: ReportEntry) {
  return a.category.localeCompare(b.category);
}

function sumTotalHours(entrie: ReportEntry[]) {
  const totalHours = entrie.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
  return normalizeDuration(totalHours);
}
