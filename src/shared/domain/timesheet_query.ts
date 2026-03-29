// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class TimesheetQuery {
  static create({
    from,
    to,
    today,
    timeZone,
  }: {
    from: Temporal.PlainDateLike | string;
    to: Temporal.PlainDateLike | string;
    today?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  }): TimesheetQuery {
    return new TimesheetQuery(from, to, today, timeZone);
  }

  static createTestInstance({
    from = "2026-03-23",
    to = "2026-03-29",
    today = "2026-03-25",
    timeZone = "Europe/Berlin",
  }: {
    from?: Temporal.PlainDateLike | string;
    to?: Temporal.PlainDateLike | string;
    today?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  } = {}): TimesheetQuery {
    return TimesheetQuery.create({ from, to, today, timeZone });
  }

  readonly from: Temporal.PlainDate;
  readonly to: Temporal.PlainDate;
  readonly today?: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
    today?: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.from = Temporal.PlainDate.from(from);
    this.to = Temporal.PlainDate.from(to);
    this.today = today ? Temporal.PlainDate.from(today) : undefined;
    this.timeZone = timeZone;
  }
}

export class TimesheetQueryResult {
  static create({
    entries = [],
    totalHours = "PT0S",
    capacity = Capacity.create(),
  }: {
    entries?: TimesheetEntry[];
    totalHours?: Temporal.DurationLike | string;
    capacity?: Capacity;
  } = {}): TimesheetQueryResult {
    return new TimesheetQueryResult(entries, totalHours, capacity);
  }

  static createTestInstance({
    entries = [TimesheetEntry.createTestInstance()],
    totalHours = "PT2H",
    capacity = Capacity.createTestInstance(),
  }: {
    entries?: TimesheetEntry[];
    totalHours?: Temporal.DurationLike | string;
    capacity?: Capacity;
  } = {}): TimesheetQueryResult {
    return TimesheetQueryResult.create({ entries, totalHours, capacity });
  }

  readonly entries: TimesheetEntry[];
  readonly totalHours: Temporal.Duration;
  readonly capacity: Capacity;

  private constructor(
    entries: TimesheetEntry[],
    totalHours: Temporal.DurationLike | string,
    capacity: Capacity,
  ) {
    this.entries = entries.map((entry) => TimesheetEntry.create(entry));
    this.totalHours = Temporal.Duration.from(totalHours);
    this.capacity = Capacity.create(capacity);
  }
}

export class TimesheetEntry {
  static create({
    date,
    client,
    project,
    task,
    hours,
  }: {
    date: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
    hours: Temporal.DurationLike | string;
  }): TimesheetEntry {
    return new TimesheetEntry(date, client, project, task, hours);
  }

  static createTestInstance({
    date = Temporal.PlainDate.from("2025-06-04"),
    client = "Test client",
    project = "Test project",
    task = "Test task",
    hours = Temporal.Duration.from("PT2H"),
  }: {
    date?: Temporal.PlainDateLike | string;
    client?: string;
    project?: string;
    task?: string;
    hours?: Temporal.DurationLike | string;
  } = {}): TimesheetEntry {
    return TimesheetEntry.create({ date, client, project, task, hours });
  }

  readonly date: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;

  private constructor(
    date: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike | string,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = Temporal.Duration.from(hours);
  }
}

export class Capacity {
  static create({
    hours = "PT40H",
    offset = "-PT40H",
  }: {
    hours?: Temporal.DurationLike | string;
    offset?: Temporal.DurationLike | string;
  } = {}): Capacity {
    return new Capacity(hours, offset);
  }

  static createTestInstance({
    hours = "PT2H",
    offset = "-PT38H",
  }: {
    hours?: Temporal.DurationLike | string;
    offset?: Temporal.DurationLike | string;
  } = {}): Capacity {
    return Capacity.create({ hours, offset });
  }

  readonly hours: Temporal.Duration;
  readonly offset: Temporal.Duration;

  private constructor(
    hours: Temporal.DurationLike | string,
    offset: Temporal.DurationLike | string,
  ) {
    this.hours = Temporal.Duration.from(hours);
    this.offset = Temporal.Duration.from(offset);
  }
}
