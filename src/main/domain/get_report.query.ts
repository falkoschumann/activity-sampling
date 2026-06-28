// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityState } from "./logged-activity/activity.aggregate";
import type { ReportView } from "./report.read_model";
import {
  type GetReportQuery,
  GetReportQueryResult,
  ReportScope,
} from "../../shared/domain/get_report.query";
import { ReportEntry } from "../../shared/domain/report_entry";
import { normalizeDuration } from "../../shared/domain/temporal";

export function getReport(
  view: ReportView,
  query: GetReportQuery,
): GetReportQueryResult {
  const entries = createEntries(view.activities, query);
  const totalHours = sumTotalHours(entries);
  return GetReportQueryResult.create({ entries, totalHours });
}

function createEntries(activities: ActivityState[], query: GetReportQuery) {
  switch (query.data.scope) {
    case ReportScope.CLIENTS:
      return createClientsReport(activities);
    case ReportScope.PROJECTS:
      return createProjectsReport(activities);
    case ReportScope.TASKS:
      return createTasksReport(activities);
    case ReportScope.CATEGORIES:
      return createCategoriesReport(activities);
  }
}

function createClientsReport(activities: ActivityState[]) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateClientsReport(entries, activity);
  }
  entries.sort(compareClientsReport);
  return entries;
}

function updateClientsReport(entries: ReportEntry[], activity: ActivityState) {
  let { start, finish } = activity;
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
  return a.client!.localeCompare(b.client!);
}

function createProjectsReport(activities: ActivityState[]) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateProjectsReport(entries, activity);
  }
  entries.sort(compareProjectsReport);
  return entries;
}

function updateProjectsReport(entries: ReportEntry[], activity: ActivityState) {
  let { start, finish } = activity;
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
    let client = entry.client!;
    if (!client.includes(activity.client)) {
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
  return a.project!.localeCompare(b.project!);
}

function createTasksReport(activities: ActivityState[]) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateTasksReport(entries, activity);
  }
  entries.sort(compareTasksReport);
  return entries;
}

function updateTasksReport(entries: ReportEntry[], activity: ActivityState) {
  let { start, finish } = activity;
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
    let category = entry.category!;
    if (
      category != null &&
      activity.category != null &&
      !category.includes(activity.category)
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
  const taskComparison = a.task!.localeCompare(b.task!);
  if (taskComparison !== 0) {
    return taskComparison;
  }

  const projectComparison = a.project!.localeCompare(b.project!);
  if (projectComparison !== 0) {
    return projectComparison;
  }

  return a.client!.localeCompare(b.client!);
}

function createCategoriesReport(activities: ActivityState[]) {
  const entries: ReportEntry[] = [];
  for (const activity of activities) {
    updateCategoriesReport(entries, activity);
  }
  entries.sort(compareCategoriesReport);
  return entries;
}

function updateCategoriesReport(
  entries: ReportEntry[],
  activity: ActivityState,
) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) => entry.category === (activity.category ?? "N/A"),
  );
  if (index == -1) {
    entries.push(
      ReportEntry.create({
        start,
        finish,
        category: activity.category ?? "N/A",
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
  return a.category!.localeCompare(b.category!);
}

function sumTotalHours(entries: ReportEntry[]) {
  const totalHours = entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
  return normalizeDuration(totalHours);
}
