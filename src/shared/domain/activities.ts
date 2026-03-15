// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

// region Queries

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
    entries,
    totalHours,
    capacity,
  }: {
    entries: TimesheetEntry[];
    totalHours: Temporal.DurationLike | string;
    capacity: Capacity;
  }): TimesheetQueryResult {
    return new TimesheetQueryResult(entries, totalHours, capacity);
  }

  static empty(): TimesheetQueryResult {
    return TimesheetQueryResult.create({
      entries: [],
      totalHours: Temporal.Duration.from("PT0S"),
      capacity: Capacity.empty(),
    });
  }

  readonly entries: TimesheetEntry[];
  readonly totalHours: Temporal.Duration;
  readonly capacity: Capacity;

  private constructor(
    entries: TimesheetEntry[],
    totalHours: Temporal.DurationLike | string,
    capacity: Capacity,
  ) {
    this.entries = entries;
    this.totalHours = Temporal.Duration.from(totalHours);
    this.capacity = capacity;
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
    hours,
    offset,
  }: {
    hours: Temporal.DurationLike | string;
    offset: Temporal.DurationLike | string;
  }): Capacity {
    return new Capacity(hours, offset);
  }

  static empty(): Capacity {
    return Capacity.create({
      hours: Temporal.Duration.from("PT40H"),
      offset: Temporal.Duration.from("-PT40H"),
    });
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

// endregion

// region Events

export class ActivityLoggedEvent {
  // TODO rename ActivityLoggedEvent to LoggedActivity
  // TODO remove duration?

  static create({
    dateTime,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    dateTime: Temporal.PlainDateTimeLike | string;
    duration: Temporal.DurationLike | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): ActivityLoggedEvent {
    return new ActivityLoggedEvent(
      dateTime,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static createTestInstance({
    dateTime = "2025-08-14T13:00",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
  }: {
    dateTime?: Temporal.PlainDateTimeLike | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
  } = {}): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      dateTime,
      duration,
      client,
      project,
      task,
      notes,
      category,
    });
  }

  readonly dateTime: Temporal.PlainDateTime;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    dateTime: Temporal.PlainDateTimeLike | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.dateTime = Temporal.PlainDateTime.from(dateTime);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }
}
