// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class GetReportQuery {
  static create({
    scope,
    from,
    to,
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    scope: ReportScope;
    from?: Temporal.PlainDateLike;
    to?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetReportQuery(scope, timeZone, from, to);
  }

  static createTestInstance({
    scope = ReportScope.TASKS,
    from = "2026-02-01",
    to = "2026-02-28",
    timeZone,
  }: {
    scope?: ReportScope;
    from?: Temporal.PlainDateLike;
    to?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetReportQuery.create({ scope, from, to, timeZone });
  }

  readonly type = "get-report";
  readonly data;

  private constructor(
    scope: ReportScope,
    timeZone: Temporal.TimeZoneLike,
    from?: Temporal.PlainDateLike,
    to?: Temporal.PlainDateLike,
  ) {
    this.data = {
      scope,
      from: from ? Temporal.PlainDate.from(from) : undefined,
      to: to ? Temporal.PlainDate.from(to) : undefined,
      timeZone,
    };
  }
}

export const ReportScope = Object.freeze({
  CLIENTS: "Clients",
  PROJECTS: "Projects",
  TASKS: "Tasks",
  CATEGORIES: "Categories",
});

export type ReportScope = (typeof ReportScope)[keyof typeof ReportScope];

export class GetReportQueryResult {
  static create({
    entries = [],
    totalHours = "PT0S",
  }: {
    entries?: ReportEntry[];
    totalHours?: Temporal.DurationLike;
  } = {}) {
    return new GetReportQueryResult(entries, totalHours);
  }

  static createTestInstance({
    entries = [ReportEntry.createTestInstance()],
    totalHours = "PT8H",
  }: {
    entries?: ReportEntry[];
    totalHours?: Temporal.DurationLike;
  } = {}) {
    return GetReportQueryResult.create({ entries, totalHours });
  }

  readonly entries: ReportEntry[];
  readonly totalHours: Temporal.Duration;

  private constructor(
    entries: ReportEntry[],
    totalHours: Temporal.DurationLike,
  ) {
    this.entries = entries.map((entry) => ReportEntry.create(entry));
    this.totalHours = Temporal.Duration.from(totalHours);
  }
}

export class ReportEntry {
  // TODO replace with Activity and model N/A with optional property
  static create({
    start,
    finish,
    client = "N/A",
    project = "N/A",
    task = "N/A",
    category = "N/A",
    hours,
    cycleTime,
  }: {
    start: Temporal.PlainDateLike;
    finish: Temporal.PlainDateLike;
    client?: string;
    project?: string;
    task?: string;
    category?: string;
    hours: Temporal.DurationLike;
    cycleTime: number;
  }) {
    return new ReportEntry(
      start,
      finish,
      client,
      project,
      task,
      category,
      hours,
      cycleTime,
    );
  }

  static createTestInstance({
    start = Temporal.PlainDate.from("2025-11-19"),
    finish = Temporal.PlainDate.from("2025-11-19"),
    client = "Test client",
    project,
    task,
    category,
    hours = Temporal.Duration.from("PT8H"),
    cycleTime = 1,
  }: {
    start?: Temporal.PlainDateLike;
    finish?: Temporal.PlainDateLike;
    client?: string;
    project?: string;
    task?: string;
    category?: string;
    hours?: Temporal.DurationLike;
    cycleTime?: number;
  } = {}) {
    return ReportEntry.create({
      start,
      finish,
      client,
      project,
      task,
      category,
      hours,
      cycleTime,
    });
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category: string;
  readonly hours: Temporal.Duration;
  readonly cycleTime: number;

  private constructor(
    start: Temporal.PlainDateLike,
    finish: Temporal.PlainDateLike,
    client: string,
    project: string,
    task: string,
    category: string,
    hours: Temporal.DurationLike,
    cycleTime: number,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.category = category;
    this.hours = Temporal.Duration.from(hours);
    this.cycleTime = cycleTime;
  }
}
