// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { ActivityLoggedEvent } from "./activities";

// TODO replace ActivityLoggedEvent with domain object

export class RecentActivitiesQuery {
  static create({
    today,
    timeZone,
  }: {
    today?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  } = {}): RecentActivitiesQuery {
    return new RecentActivitiesQuery(today, timeZone);
  }

  readonly today?: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    today?: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.today = today ? Temporal.PlainDate.from(today) : undefined;
    this.timeZone = timeZone;
  }
}

export class RecentActivitiesQueryResult {
  static create({
    workingDays,
    timeSummary,
  }: {
    workingDays: WorkingDay[];
    timeSummary: TimeSummary;
  }): RecentActivitiesQueryResult {
    return new RecentActivitiesQueryResult(workingDays, timeSummary);
  }

  static empty(): RecentActivitiesQueryResult {
    // TODO replace xxxResult.empty() with xxxResult.create() pattern throughout the codebase
    return RecentActivitiesQueryResult.create({
      workingDays: [],
      timeSummary: {
        hoursToday: Temporal.Duration.from("PT0S"),
        hoursYesterday: Temporal.Duration.from("PT0S"),
        hoursThisWeek: Temporal.Duration.from("PT0S"),
        hoursThisMonth: Temporal.Duration.from("PT0S"),
      },
    });
  }

  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;

  private constructor(workingDays: WorkingDay[], timeSummary: TimeSummary) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }
}

export class WorkingDay {
  static create({
    date,
    activities,
  }: {
    date: Temporal.PlainDateLike | string;
    activities: ActivityLoggedEvent[];
  }): WorkingDay {
    return new WorkingDay(date, activities);
  }

  readonly date: Temporal.PlainDate;
  readonly activities: ActivityLoggedEvent[];

  private constructor(
    date: Temporal.PlainDateLike | string,
    activities: ActivityLoggedEvent[],
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.activities = activities;
  }
}

export class TimeSummary {
  static create({
    hoursToday,
    hoursYesterday,
    hoursThisWeek,
    hoursThisMonth,
  }: {
    hoursToday: Temporal.DurationLike | string;
    hoursYesterday: Temporal.DurationLike | string;
    hoursThisWeek: Temporal.DurationLike | string;
    hoursThisMonth: Temporal.DurationLike | string;
  }): TimeSummary {
    return new TimeSummary(
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  readonly hoursToday: Temporal.Duration;
  readonly hoursYesterday: Temporal.Duration;
  readonly hoursThisWeek: Temporal.Duration;
  readonly hoursThisMonth: Temporal.Duration;

  private constructor(
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
