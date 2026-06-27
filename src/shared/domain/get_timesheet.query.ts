// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimesheetEntry } from "./timesheet_entry";
import { Capacity } from "./capacity";

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
    this.entries = entries.map((entry) => TimesheetEntry.create(entry));
    this.totalHours = Temporal.Duration.from(totalHours);
    this.capacity = Capacity.create(capacity);
  }
}
