// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class ReportQuery {
  static create({
    scope,
    from,
    to,
    timeZone,
  }: {
    scope: ReportScope;
    from?: Temporal.PlainDateLike | string;
    to?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  }): ReportQuery {
    return new ReportQuery(scope, from, to, timeZone);
  }

  static createTestInstance({
    scope = ReportScope.TASKS,
    from = "2026-02-01",
    to = "2026-02-28",
    timeZone,
  }: {
    scope?: ReportScope;
    from?: Temporal.PlainDateLike | string;
    to?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  } = {}): ReportQuery {
    return ReportQuery.create({ scope, from, to, timeZone });
  }

  readonly scope: ReportScope;
  readonly from?: Temporal.PlainDate;
  readonly to?: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    scope: ReportScope,
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

export const ReportScope = Object.freeze({
  CLIENTS: "Clients",
  PROJECTS: "Projects",
  TASKS: "Tasks",
  CATEGORIES: "Categories",
});

export type ReportScope = (typeof ReportScope)[keyof typeof ReportScope];

export class ReportQueryResult {
  static create({
    entries = [],
    totalHours = "PT0S",
  }: {
    entries?: ReportEntry[];
    totalHours?: Temporal.DurationLike | string;
  } = {}): ReportQueryResult {
    return new ReportQueryResult(entries, totalHours);
  }

  static createTestInstance({
    entries = [ReportEntry.createTestInstance()],
    totalHours = "PT8H",
  }: {
    entries?: ReportEntry[];
    totalHours?: Temporal.DurationLike | string;
  } = {}): ReportQueryResult {
    return ReportQueryResult.create({ entries, totalHours });
  }

  readonly entries: ReportEntry[];
  readonly totalHours: Temporal.Duration;

  private constructor(
    entries: ReportEntry[],
    totalHours: Temporal.DurationLike | string,
  ) {
    this.entries = entries.map((entry) => ReportEntry.create(entry));
    this.totalHours = Temporal.Duration.from(totalHours);
  }
}

export class ReportEntry {
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
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client?: string;
    project?: string;
    task?: string;
    category?: string;
    hours: Temporal.DurationLike | string;
    cycleTime: number;
  }): ReportEntry {
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
  }: Partial<ReportEntry> = {}): ReportEntry {
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
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    category: string,
    hours: Temporal.DurationLike | string,
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
