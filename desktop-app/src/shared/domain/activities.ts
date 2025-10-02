// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

//
// Commands
//

export class LogActivityCommand {
  static createTestInstance({
    timestamp = "2025-08-14T11:00:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
  }: {
    timestamp?: Temporal.Instant | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  } = {}): LogActivityCommand {
    return new LogActivityCommand(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
  ) {
    this.timestamp = Temporal.Instant.from(timestamp);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}

//
// Queries
//

export class RecentActivitiesQuery {
  readonly timeZone?: Temporal.TimeZoneLike;

  constructor(timeZone?: Temporal.TimeZoneLike) {
    this.timeZone = timeZone;
  }
}

export class RecentActivitiesQueryResult {
  static empty(): RecentActivitiesQueryResult {
    return new RecentActivitiesQueryResult([], {
      hoursToday: Temporal.Duration.from("PT0S"),
      hoursYesterday: Temporal.Duration.from("PT0S"),
      hoursThisWeek: Temporal.Duration.from("PT0S"),
      hoursThisMonth: Temporal.Duration.from("PT0S"),
    });
  }

  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;

  constructor(workingDays: WorkingDay[], timeSummary: TimeSummary) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }
}

export class WorkingDay {
  readonly date: Temporal.PlainDate;
  readonly activities: Activity[];

  constructor(date: Temporal.PlainDateLike | string, activities: Activity[]) {
    this.date = Temporal.PlainDate.from(date);
    this.activities = activities;
  }
}

export class Activity {
  static createTestInstance({
    dateTime = "2025-08-14T13:00",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
  }: {
    dateTime?: Temporal.PlainDateLike | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  } = {}): Activity {
    return new Activity(dateTime, duration, client, project, task, notes);
  }

  readonly dateTime: Temporal.PlainDateTime;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(
    dateTime: Temporal.PlainDateTimeLike | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
  ) {
    this.dateTime = Temporal.PlainDateTime.from(dateTime);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}

export class TimeSummary {
  readonly hoursToday: Temporal.Duration;
  readonly hoursYesterday: Temporal.Duration;
  readonly hoursThisWeek: Temporal.Duration;
  readonly hoursThisMonth: Temporal.Duration;

  constructor(
    hoursToday: Temporal.DurationLike | string,
    hoursYesterday: Temporal.DurationLike | string,
    hoursThisWeek: Temporal.DurationLike | string,
    hoursThisMonth: Temporal.DurationLike | string,
  ) {
    this.hoursToday = Temporal.Duration.from(hoursToday);
    this.hoursYesterday = Temporal.Duration.from(hoursYesterday);
    this.hoursThisWeek = Temporal.Duration.from(hoursThisWeek);
    this.hoursThisMonth = Temporal.Duration.from(hoursThisMonth);
  }
}

export class ReportQuery {
  static createTestInstance({
    scope = Scope.PROJECTS,
    from = Temporal.PlainDate.from("2025-06-01"),
    to = Temporal.PlainDate.from("2025-06-30"),
    timeZone = "Europe/Berlin",
  }: Partial<ReportQuery> = {}): ReportQuery {
    return new ReportQuery(scope, from, to, timeZone);
  }

  readonly scope: Scope;
  readonly from?: Temporal.PlainDate;
  readonly to?: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  constructor(
    scope: Scope,
    from?: Temporal.PlainDateLike | string,
    to?: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.scope = scope;
    this.from = from ? Temporal.PlainDate.from(from) : undefined;
    this.to = to ? Temporal.PlainDate.from(to) : undefined;
    this.timeZone = timeZone;
  }
}

export const Scope = Object.freeze({
  CLIENTS: "Clients",
  PROJECTS: "Projects",
  TASKS: "Tasks",
});

export type Scope = (typeof Scope)[keyof typeof Scope];

export class ReportQueryResult {
  readonly entries: ReportEntry[];
  readonly totalHours: Temporal.Duration;

  constructor(
    entries: ReportEntry[],
    totalHours: Temporal.DurationLike | string,
  ) {
    this.entries = entries;
    this.totalHours = Temporal.Duration.from(totalHours);
  }
}

export class ReportEntry {
  static createTestInstance({
    name = "Test client",
    hours = Temporal.Duration.from("PT42H"),
    client,
  }: Partial<ReportEntry> = {}): ReportEntry {
    return new ReportEntry(name, hours, client);
  }

  readonly name: string;
  readonly hours: Temporal.Duration;
  readonly client?: string;

  constructor(
    name: string,
    hours: Temporal.DurationLike | string,
    client?: string,
  ) {
    this.name = name;
    this.hours = Temporal.Duration.from(hours);
    this.client = client;
  }
}

export class TimesheetQuery {
  static createTestInstance({
    from = Temporal.PlainDate.from("2025-06-02"),
    to = Temporal.PlainDate.from("2025-06-08"),
    timeZone = "Europe/Berlin",
  }: Partial<TimesheetQuery> = {}): TimesheetQuery {
    return new TimesheetQuery(from, to, timeZone);
  }

  readonly from: Temporal.PlainDate;
  readonly to: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  constructor(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.from = Temporal.PlainDate.from(from);
    this.to = Temporal.PlainDate.from(to);
    this.timeZone = timeZone;
  }
}

export class TimesheetQueryResult {
  static empty(): TimesheetQueryResult {
    return new TimesheetQueryResult(
      [],
      Temporal.Duration.from("PT0S"),
      Capacity.empty(),
    );
  }

  readonly entries: TimesheetEntry[];
  readonly totalHours: Temporal.Duration;
  readonly capacity: Capacity;

  constructor(
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
  static createTestInstance({
    date = Temporal.PlainDate.from("2025-06-04"),
    client = "Test client",
    project = "Test project",
    task = "Test task",
    hours = Temporal.Duration.from("PT2H"),
  }: Partial<TimesheetEntry> = {}): TimesheetEntry {
    return new TimesheetEntry(date, client, project, task, hours);
  }

  readonly date: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;

  constructor(
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
  static empty(): Capacity {
    return new Capacity(
      Temporal.Duration.from("PT40M"),
      Temporal.Duration.from("-PT40M"),
    );
  }

  readonly hours: Temporal.Duration;
  readonly offset: Temporal.Duration;

  constructor(
    hours: Temporal.DurationLike | string,
    offset: Temporal.DurationLike | string,
  ) {
    this.hours = Temporal.Duration.from(hours);
    this.offset = Temporal.Duration.from(offset);
  }
}

//
// Events
//

export class ActivityLoggedEvent {
  static createTestInstance({
    timestamp = "2025-08-14T11:00:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
  }: {
    timestamp?: Temporal.Instant | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  } = {}): ActivityLoggedEvent {
    return new ActivityLoggedEvent(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
  ) {
    this.timestamp = Temporal.Instant.from(timestamp);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}
