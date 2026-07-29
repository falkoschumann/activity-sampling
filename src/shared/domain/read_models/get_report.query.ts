// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ReportView } from "./report.read_model";
import {
  type ActivityState,
  createActivity,
} from "../activity/activity.aggregate";

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
  readonly entries: ActivityState[];
  readonly totalHours: Temporal.DurationLike;
}

export function createGetReportQueryResult({
  entries = [],
  totalHours = "PT0S",
}: {
  entries?: ActivityState[];
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
  const entries: ActivityState[] = [];
  for (const activity of activities) {
    updateClientsReport(entries, activity);
  }
  entries.sort(compareClientsReport);
  return entries;
}

function updateClientsReport(
  entries: ActivityState[],
  activity: ActivityState,
) {
  let { start, finish } = activity;
  const index = entries.findIndex((entry) => entry.client === activity.client);
  if (index == -1) {
    const newEntry = createActivity({
      start,
      finish,
      client: activity.client,
      project: "N/A",
      task: "N/A",
      hours: activity.hours,
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
    const hours = Temporal.Duration.from(activity.hours).add(
      existingEntry.hours,
    );
    entries[index] = createActivity({
      start,
      finish,
      client: activity.client,
      project: "N/A",
      task: "N/A",
      hours,
    });
  }
}

function compareClientsReport(a: ActivityState, b: ActivityState) {
  return a.client!.localeCompare(b.client!);
}

function createProjectsReport(activities: ActivityState[]) {
  const entries: ActivityState[] = [];
  for (const activity of activities) {
    updateProjectsReport(entries, activity);
  }
  entries.sort(compareProjectsReport);
  return entries;
}

function updateProjectsReport(
  entries: ActivityState[],
  activity: ActivityState,
) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) => entry.project === activity.project,
  );
  if (index == -1) {
    const newEntry = createActivity({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: "N/A",
      hours: activity.hours,
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
    const hours = Temporal.Duration.from(activity.hours).add(
      existingEntry.hours,
    );
    entries[index] = createActivity({
      start,
      finish,
      client,
      project: activity.project,
      task: "N/A",
      hours,
    });
  }
}

function compareProjectsReport(a: ActivityState, b: ActivityState) {
  return a.project!.localeCompare(b.project!);
}

function createTasksReport(activities: ActivityState[]) {
  const entries: ActivityState[] = [];
  for (const activity of activities) {
    updateTasksReport(entries, activity);
  }
  entries.sort(compareTasksReport);
  return entries;
}

function updateTasksReport(entries: ActivityState[], activity: ActivityState) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) =>
      entry.task === activity.task &&
      entry.project === activity.project &&
      entry.client === activity.client,
  );
  if (index == -1) {
    const newEntry = createActivity({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      category: activity.category,
      hours: activity.hours,
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
    const hours = Temporal.Duration.from(activity.hours).add(
      existingEntry.hours,
    );
    entries[index] = createActivity({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      category,
      hours,
    });
  }
}

function compareTasksReport(a: ActivityState, b: ActivityState) {
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
  const entries: ActivityState[] = [];
  for (const activity of activities) {
    updateCategoriesReport(entries, activity);
  }
  entries.sort(compareCategoriesReport);
  return entries;
}

function updateCategoriesReport(
  entries: ActivityState[],
  activity: ActivityState,
) {
  let { start, finish } = activity;
  const index = entries.findIndex(
    (entry) => entry.category === (activity.category ?? "N/A"),
  );
  if (index == -1) {
    const newEntry = createActivity({
      start,
      finish,
      client: "N/A",
      project: "N/A",
      task: "N/A",
      category: activity.category ?? "N/A",
      hours: activity.hours,
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
    const hours = Temporal.Duration.from(activity.hours).add(
      existingEntry.hours,
    );
    entries[index] = createActivity({
      start,
      finish,
      client: "N/A",
      project: "N/A",
      task: "N/A",
      category: existingEntry.category,
      hours,
    });
  }
}

function compareCategoriesReport(a: ActivityState, b: ActivityState) {
  return a.category!.localeCompare(b.category!);
}

function sumTotalHours(entries: ActivityState[]) {
  const totalHours = entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
  return Temporal.Duration.from(totalHours)
    .round({ smallestUnit: "minute", largestUnit: "hour" })
    .toString();
}
