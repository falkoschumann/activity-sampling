// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ReportView } from "./report.read_model";
import {
  type Activity,
  createActivity,
  normalizeDuration,
} from "../value_objects/activity.value_object";

export interface GetReportQuery {
  readonly type: "get-report";
  readonly data: GetReportQueryData;
}

export type GetReportQueryData = Readonly<{
  scope: ReportScope;
  timeZone: Temporal.TimeZoneLike;
  from?: Temporal.PlainDateLike;
  to?: Temporal.PlainDateLike;
}>;

export function createGetReportQuery({
  scope,
  from,
  to,
  timeZone = Temporal.Now.timeZoneId(),
}: {
  scope: ReportScope;
  from?: Temporal.PlainDateLike;
  to?: Temporal.PlainDateLike;
  timeZone?: Temporal.TimeZoneLike;
}): GetReportQuery {
  return {
    type: "get-report",
    data: { scope, timeZone, from, to },
  };
}

export const ReportScope = Object.freeze({
  CLIENTS: "Clients",
  PROJECTS: "Projects",
  TASKS: "Tasks",
  CATEGORIES: "Categories",
});

export type ReportScope = (typeof ReportScope)[keyof typeof ReportScope];

export interface GetReportQueryResult {
  readonly entries: Activity[];
  readonly totalHours: Temporal.DurationLike;
}

export function createGetReportQueryResult({
  entries = [],
  totalHours = "PT0S",
}: {
  entries?: Activity[];
  totalHours?: Temporal.DurationLike;
} = {}): GetReportQueryResult {
  return { entries, totalHours };
}

export function getReport(
  view: ReportView,
  query: GetReportQuery,
): GetReportQueryResult {
  const entries = createEntries(view.activities, query);
  const totalHours = sumTotalHours(entries);
  return createGetReportQueryResult({ entries, totalHours });
}

function createEntries(activities: Activity[], query: GetReportQuery) {
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

function createClientsReport(activities: Activity[]) {
  const entries: Activity[] = [];
  for (const activity of activities) {
    updateClientsReport(entries, activity);
  }
  entries.sort(compareClientsReport);
  return entries;
}

function updateClientsReport(entries: Activity[], activity: Activity) {
  let { start, finish } = activity;
  const index = entries.findIndex((entry) => entry.client === activity.client);
  if (index == -1) {
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    const newEntry = createActivity({
      start,
      finish,
      client: activity.client,
      project: "N/A",
      task: "N/A",
      hours: activity.hours,
      cycleTime,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, existingEntry.start) < 0
        ? start
        : existingEntry.start;
    finish =
      Temporal.PlainDate.compare(finish, existingEntry.finish) > 0
        ? finish
        : existingEntry.finish;
    const hours = normalizeDuration(
      Temporal.Duration.from(activity.hours).add(existingEntry.hours),
    );
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    entries[index] = createActivity({
      start,
      finish,
      client: activity.client,
      project: "N/A",
      task: "N/A",
      hours,
      cycleTime,
    });
  }
}

function compareClientsReport(a: Activity, b: Activity) {
  return a.client!.localeCompare(b.client!);
}

function createProjectsReport(activities: Activity[]) {
  const entries: Activity[] = [];
  for (const activity of activities) {
    updateProjectsReport(entries, activity);
  }
  entries.sort(compareProjectsReport);
  return entries;
}

function updateProjectsReport(entries: Activity[], activity: Activity) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) => entry.project === activity.project,
  );
  if (index == -1) {
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    const newEntry = createActivity({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: "N/A",
      hours: activity.hours,
      cycleTime,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, existingEntry.start) < 0
        ? start
        : existingEntry.start;
    finish =
      Temporal.PlainDate.compare(finish, existingEntry.finish) > 0
        ? finish
        : existingEntry.finish;
    let client = existingEntry.client!;
    if (!client.includes(activity.client)) {
      const clients = client.split(", ");
      clients.push(activity.client);
      clients.sort();
      client = clients.join(", ");
    }
    const hours = normalizeDuration(
      Temporal.Duration.from(activity.hours).add(existingEntry.hours),
    );
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    entries[index] = createActivity({
      start,
      finish,
      client,
      project: activity.project,
      task: "N/A",
      hours,
      cycleTime,
    });
  }
}

function compareProjectsReport(a: Activity, b: Activity) {
  return a.project!.localeCompare(b.project!);
}

function createTasksReport(activities: Activity[]) {
  const entries: Activity[] = [];
  for (const activity of activities) {
    updateTasksReport(entries, activity);
  }
  entries.sort(compareTasksReport);
  return entries;
}

function updateTasksReport(entries: Activity[], activity: Activity) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) =>
      entry.task === activity.task &&
      entry.project === activity.project &&
      entry.client === activity.client,
  );
  if (index == -1) {
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    const newEntry = createActivity({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      category: activity.category,
      hours: activity.hours,
      cycleTime,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, existingEntry.start) < 0
        ? start
        : existingEntry.start;
    finish =
      Temporal.PlainDate.compare(finish, existingEntry.finish) > 0
        ? finish
        : existingEntry.finish;
    let category = existingEntry.category!;
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
    const hours = normalizeDuration(
      Temporal.Duration.from(activity.hours).add(existingEntry.hours),
    );
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    entries[index] = createActivity({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      category,
      hours,
      cycleTime,
    });
  }
}

function compareTasksReport(a: Activity, b: Activity) {
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

function createCategoriesReport(activities: Activity[]) {
  const entries: Activity[] = [];
  for (const activity of activities) {
    updateCategoriesReport(entries, activity);
  }
  entries.sort(compareCategoriesReport);
  return entries;
}

function updateCategoriesReport(entries: Activity[], activity: Activity) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) => entry.category === (activity.category ?? "N/A"),
  );
  if (index == -1) {
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    const newEntry = createActivity({
      start,
      finish,
      client: "N/A",
      project: "N/A",
      task: "N/A",
      category: activity.category ?? "N/A",
      hours: activity.hours,
      cycleTime,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, existingEntry.start) < 0
        ? start
        : existingEntry.start;
    finish =
      Temporal.PlainDate.compare(finish, existingEntry.finish) > 0
        ? finish
        : existingEntry.finish;
    const hours = normalizeDuration(
      Temporal.Duration.from(activity.hours).add(existingEntry.hours),
    );
    const cycleTime =
      Temporal.PlainDate.from(finish).since(start).total("days") + 1;
    entries[index] = createActivity({
      start,
      finish,
      client: "N/A",
      project: "N/A",
      task: "N/A",
      category: existingEntry.category,
      hours,
      cycleTime,
    });
  }
}

function compareCategoriesReport(a: Activity, b: Activity) {
  return a.category!.localeCompare(b.category!);
}

function sumTotalHours(entries: Activity[]) {
  const totalHours = entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
  return normalizeDuration(totalHours);
}
