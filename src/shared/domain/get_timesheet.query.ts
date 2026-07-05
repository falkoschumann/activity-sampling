// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetView, TimesheetViewEntry } from "./timesheet.read_model";
import {
  compareTimesheetEntry,
  createTimesheetEntry,
  type TimesheetEntry,
} from "./timesheet_entry.value_object";
import { type Capacity, createCapacity } from "./capacity.value_object";
import { countWorkingHours } from "./calendar.service";
import { normalizeDuration } from "./activity";

export interface GetTimesheetQuery {
  readonly type: "get-timesheet";
  readonly data: GetTimesheetQueryData;
}

export type GetTimesheetQueryData = Readonly<{
  from: Temporal.PlainDateLike;
  to: Temporal.PlainDateLike;
  today: Temporal.PlainDateLike;
  timeZone: Temporal.TimeZoneLike;
}>;

export function createGetTimesheetQuery({
  from,
  to,
  today = Temporal.Now.plainDateISO(),
  timeZone = Temporal.Now.timeZoneId(),
}: {
  from: Temporal.PlainDateLike;
  to: Temporal.PlainDateLike;
  today?: Temporal.PlainDateLike;
  timeZone?: Temporal.TimeZoneLike;
}): GetTimesheetQuery {
  return {
    type: "get-timesheet",
    data: { from, to, today, timeZone },
  };
}

export interface GetTimesheetQueryResult {
  readonly entries: TimesheetEntry[];
  readonly totalHours: Temporal.DurationLike;
  readonly capacity: Capacity;
}

export function createGetTimesheetQueryResult({
  entries = [],
  totalHours = "PT0S",
  capacity = createCapacity(),
}: {
  entries?: TimesheetEntry[];
  totalHours?: Temporal.DurationLike;
  capacity?: Capacity;
} = {}): GetTimesheetQueryResult {
  return { entries, totalHours, capacity };
}

export function getTimesheet(
  view: TimesheetView,
  query: GetTimesheetQuery,
): GetTimesheetQueryResult {
  // we assume the view is pre-filtered by from and to date
  const entries = createEntries(view);
  const totalHours = sumTotalHours(entries);
  const capacity = determineCapacity(view, query, totalHours);
  return createGetTimesheetQueryResult({ entries, capacity, totalHours });
}

function createEntries(readModel: TimesheetView) {
  const entries: TimesheetEntry[] = [];
  for (const entry of readModel.entries) {
    updateEntries(entries, entry);
  }
  entries.sort(compareTimesheetEntry);
  return entries;
}

function updateEntries(entries: TimesheetEntry[], entry: TimesheetViewEntry) {
  const date = Temporal.PlainDate.from(entry.timestamp).toString();
  const index = entries.findIndex(
    (e) =>
      Temporal.PlainDate.compare(e.date, date.toString()) === 0 &&
      e.client === entry.client &&
      e.project === entry.project &&
      e.task === entry.task,
  );
  if (index === -1) {
    const newEntry = createTimesheetEntry({
      ...entry,
      date,
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
