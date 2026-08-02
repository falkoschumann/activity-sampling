// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetView } from "./timesheet.read_model";
import {
  type Capacity,
  createCapacity,
} from "../value_objects/capacity.value_object";
import {
  compareTimesheetEntry,
  createTimesheetEntry,
  type TimesheetEntry,
} from "../value_objects/timesheet_entry.value_object";
import type { TimesheetViewEntry } from "../value_objects/timesheet_view_entry.value_object";
import { countWorkingHours } from "../services/calendar.service";

export interface GetTimesheetQuery {
  readonly type: "get-timesheet";
  readonly data: GetTimesheetQueryData;
}

export type GetTimesheetQueryData = Readonly<{
  from: Temporal.PlainDateLike;
  to: Temporal.PlainDateLike;
  today: Temporal.PlainDateLike;
  timeZone: Temporal.TimeZoneLike;
  client?: string;
  project?: string;
  isDisplayCategory: boolean;
}>;

export function createGetTimesheetQuery({
  from,
  to,
  today = Temporal.Now.plainDateISO().toString(),
  timeZone = Temporal.Now.timeZoneId(),
  client,
  project,
  isDisplayCategory = false,
}: {
  from: Temporal.PlainDateLike;
  to: Temporal.PlainDateLike;
  today?: Temporal.PlainDateLike;
  timeZone?: Temporal.TimeZoneLike;
  client?: string;
  project?: string;
  isDisplayCategory?: boolean;
}): GetTimesheetQuery {
  return {
    type: "get-timesheet",
    data: { from, to, today, timeZone, client, project, isDisplayCategory },
  };
}

export interface GetTimesheetQueryResult {
  readonly entries: TimesheetEntry[];
  readonly totalHours: Temporal.DurationLike;
  readonly capacity: Capacity;
  readonly clients: string[];
  readonly projects: string[];
}

export function createGetTimesheetQueryResult({
  entries = [],
  totalHours = "PT0S",
  capacity = createCapacity(),
  clients = [],
  projects = [],
}: {
  entries?: TimesheetEntry[];
  totalHours?: Temporal.DurationLike;
  capacity?: Capacity;
  clients?: string[];
  projects?: string[];
} = {}): GetTimesheetQueryResult {
  return { entries, totalHours, capacity, clients, projects };
}

export function getTimesheet(
  view: TimesheetView,
  query: GetTimesheetQuery,
): GetTimesheetQueryResult {
  // we assume the view is pre-filtered by from and to date
  const entries = createEntries(view, query);
  const totalHours = sumTotalHours(entries);
  const capacity = determineCapacity(view, query, totalHours);
  const clients = findAll(view, "client");
  const projects = findAll(view, "project");
  return createGetTimesheetQueryResult({
    entries,
    capacity,
    totalHours,
    clients,
    projects,
  });
}

function createEntries(readModel: TimesheetView, query: GetTimesheetQuery) {
  const entries: TimesheetEntry[] = [];
  for (const entry of readModel.entries) {
    updateEntries(entries, entry, query);
  }
  entries.sort(compareTimesheetEntry);
  return entries;
}

function updateEntries(
  entries: TimesheetEntry[],
  entry: TimesheetViewEntry,
  query: GetTimesheetQuery,
) {
  if (query.data.client && entry.client !== query.data.client) {
    return;
  }
  if (query.data.project && entry.project !== query.data.project) {
    return;
  }

  const date = Temporal.PlainDate.from(entry.timestamp).toString();
  const index = entries.findIndex(
    (e) =>
      Temporal.PlainDate.compare(e.date, date.toString()) === 0 &&
      e.client === entry.client &&
      e.project === entry.project &&
      e.task === entry.task &&
      (query.data.isDisplayCategory
        ? (e.category ?? "") === (entry.category ?? "")
        : true),
  );
  if (index === -1) {
    const newEntry = createTimesheetEntry({
      date,
      client: entry.client,
      project: entry.project,
      task: entry.task,
      category: query.data.isDisplayCategory ? entry.category : undefined,
      hours: entry.duration,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
      entry.duration,
    );
    entries[index] = createTimesheetEntry({
      ...existingEntry,
      hours: normalizeDuration(accumulatedHours),
    });
  }
}

function sumTotalHours(entries: TimesheetEntry[]) {
  const total = entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
  return normalizeDuration(total);
}

function determineCapacity(
  view: TimesheetView,
  query: GetTimesheetQuery,
  totalHours: Temporal.DurationLike,
) {
  const { from, to, today } = query.data;
  const hours = countWorkingHours(from, to, view);
  let end: Temporal.PlainDateLike;
  if (Temporal.PlainDate.compare(today, from) < 0) {
    end = from;
  } else if (Temporal.PlainDate.compare(today, to) > 0) {
    end = to;
  } else {
    end = today;
  }
  const businessDays = countWorkingHours(from, end, view);
  const offset = Temporal.Duration.from(totalHours).subtract(businessDays);

  return { hours, offset: normalizeDuration(offset) };
}

function findAll<T extends keyof TimesheetViewEntry>(
  view: TimesheetView,
  property: T,
): TimesheetViewEntry[T][] {
  return Array.from(new Set(view.entries.map((e) => e[property]))).sort();
}

function normalizeDuration(duration: Temporal.DurationLike) {
  return Temporal.Duration.from(duration)
    .round({ smallestUnit: "minute", largestUnit: "hour" })
    .toString();
}
