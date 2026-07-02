// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetView, TimesheetViewEntry } from "./timesheet.read_model";
import { TimesheetEntry } from "./timesheet_entry";
import { Capacity } from "./capacity";
import { normalizeDuration } from "./temporal";
import { countWorkingHours } from "./calendar.service";

export class GetTimesheetQuery {
  static create({
    from,
    to,
    today = Temporal.Now.plainDateISO(),
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    from: Temporal.PlainDateLike;
    to: Temporal.PlainDateLike;
    today?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetTimesheetQuery(from, to, today, timeZone);
  }

  static createTestInstance({
    from = "2026-03-23",
    to = "2026-03-29",
    today = "2026-03-25",
    timeZone = "Europe/Berlin",
  }: {
    from?: Temporal.PlainDateLike;
    to?: Temporal.PlainDateLike;
    today?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetTimesheetQuery.create({ from, to, today, timeZone });
  }

  readonly type = "get-timesheet";
  readonly data;

  private constructor(
    from: Temporal.PlainDateLike,
    to: Temporal.PlainDateLike,
    today: Temporal.PlainDateLike,
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.data = {
      from: Temporal.PlainDate.from(from),
      to: Temporal.PlainDate.from(to),
      today: Temporal.PlainDate.from(today),
      timeZone: timeZone,
    };
  }
}

export class GetTimesheetQueryResult {
  static create({
    entries = [],
    totalHours = "PT0S",
    capacity = Capacity.create(),
  }: {
    entries?: TimesheetEntry[];
    totalHours?: Temporal.DurationLike;
    capacity?: Capacity;
  } = {}) {
    return new GetTimesheetQueryResult(entries, totalHours, capacity);
  }

  static createTestInstance({
    entries = [TimesheetEntry.createTestInstance()],
    totalHours = "PT2H",
    capacity = Capacity.createTestInstance(),
  }: {
    entries?: TimesheetEntry[];
    totalHours?: Temporal.DurationLike;
    capacity?: Capacity;
  } = {}) {
    return GetTimesheetQueryResult.create({ entries, totalHours, capacity });
  }

  readonly entries;
  readonly totalHours;
  readonly capacity;

  private constructor(
    entries: TimesheetEntry[],
    totalHours: Temporal.DurationLike,
    capacity: Capacity,
  ) {
    this.entries = entries.map(TimesheetEntry.create);
    this.totalHours = Temporal.Duration.from(totalHours);
    this.capacity = Capacity.create(capacity);
  }
}

export function getTimesheet(
  view: TimesheetView,
  query: GetTimesheetQuery,
): GetTimesheetQueryResult {
  // we assume the view is pre-filtered by from and to date
  const entries = createEntries(view);
  const totalHours = sumTotalHours(entries);
  const capacity = determineCapacity(view, query, totalHours);
  return GetTimesheetQueryResult.create({ entries, capacity, totalHours });
}

function createEntries(readModel: TimesheetView) {
  const entries: TimesheetEntry[] = [];
  for (const entry of readModel.entries) {
    updateEntries(entries, entry);
  }
  entries.sort(TimesheetEntry.compare);
  return entries;
}

function updateEntries(entries: TimesheetEntry[], entry: TimesheetViewEntry) {
  const date = entry.timestamp.toPlainDate();
  const index = entries.findIndex(
    (e) =>
      Temporal.PlainDate.compare(e.date, date.toString()) === 0 &&
      e.client === entry.client &&
      e.project === entry.project &&
      e.task === entry.task,
  );
  if (index === -1) {
    const newEntry = TimesheetEntry.create({
      ...entry,
      date,
      hours: entry.duration,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    const accumulatedHours = normalizeDuration(
      existingEntry.hours.add(entry.duration),
    );
    entries[index] = TimesheetEntry.create({
      ...existingEntry,
      hours: accumulatedHours,
    });
  }
}

function sumTotalHours(entries: TimesheetEntry[]) {
  return entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
}

function determineCapacity(
  view: TimesheetView,
  query: GetTimesheetQuery,
  totalHours: Temporal.Duration,
) {
  const { from, to, today } = query.data;
  const hours = countWorkingHours(from, to, view);

  let end: Temporal.PlainDate;
  if (Temporal.PlainDate.compare(today, from) < 0) {
    end = from;
  } else if (Temporal.PlainDate.compare(today, to) > 0) {
    end = to;
  } else {
    end = today;
  }
  const businessDays = countWorkingHours(from, end, view);
  const offset = normalizeDuration(totalHours.subtract(businessDays));

  return { hours, offset };
}
