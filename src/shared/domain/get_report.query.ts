// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { ReportEntry } from "./report_entry";

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
    this.entries = entries.map(ReportEntry.create);
    this.totalHours = Temporal.Duration.from(totalHours);
  }
}
