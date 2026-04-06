// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { LoggedActivity } from "./logged_activity";

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

  static createTestInstance({
    today = "2026-03-29T11:56",
    timeZone = "Europe/Berlin",
  }: {
    today?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  } = {}): RecentActivitiesQuery {
    return RecentActivitiesQuery.create({ today, timeZone });
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
    workingDays = [],
    timeSummary = TimeSummary.create(),
  }: {
    workingDays?: WorkingDay[];
    timeSummary?: TimeSummary;
  } = {}): RecentActivitiesQueryResult {
    return new RecentActivitiesQueryResult(workingDays, timeSummary);
  }

  static createTestInstance({
    workingDays = [WorkingDay.createTestInstance()],
    timeSummary = TimeSummary.createTestInstance(),
  }: {
    workingDays?: WorkingDay[];
    timeSummary?: TimeSummary;
  } = {}): RecentActivitiesQueryResult {
    return RecentActivitiesQueryResult.create({ workingDays, timeSummary });
  }

  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;

  private constructor(workingDays: WorkingDay[], timeSummary: TimeSummary) {
    this.workingDays = workingDays.map((workingDay) =>
      WorkingDay.create(workingDay),
    );
    this.timeSummary = TimeSummary.create(timeSummary);
  }
}

export class WorkingDay {
  static create({
    date,
    activities,
  }: {
    date: Temporal.PlainDateLike | string;
    activities: LoggedActivity[];
  }): WorkingDay {
    return new WorkingDay(date, activities);
  }

  static createTestInstance({
    date = "2026-03-29T13:07",
    activities = [LoggedActivity.createTestInstance()],
  }: {
    date?: Temporal.PlainDateLike | string;
    activities?: LoggedActivity[];
  } = {}): WorkingDay {
    return new WorkingDay(date, activities);
  }

  readonly date: Temporal.PlainDate;
  readonly activities: LoggedActivity[];

  private constructor(
    date: Temporal.PlainDateLike | string,
    activities: LoggedActivity[],
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.activities = activities.map((activity) =>
      LoggedActivity.create(activity),
    );
  }
}

export class TimeSummary {
  static create({
    hoursToday = "PT0S",
    hoursYesterday = "PT0S",
    hoursThisWeek = "PT0S",
    hoursThisMonth = "PT0S",
  }: {
    hoursToday?: Temporal.DurationLike | string;
    hoursYesterday?: Temporal.DurationLike | string;
    hoursThisWeek?: Temporal.DurationLike | string;
    hoursThisMonth?: Temporal.DurationLike | string;
  } = {}): TimeSummary {
    return new TimeSummary(
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  static createTestInstance({
    hoursToday = "PT30M",
    hoursYesterday = "PT0S",
    hoursThisWeek = "PT30M",
    hoursThisMonth = "PT30M",
  }: {
    hoursToday?: Temporal.DurationLike | string;
    hoursYesterday?: Temporal.DurationLike | string;
    hoursThisWeek?: Temporal.DurationLike | string;
    hoursThisMonth?: Temporal.DurationLike | string;
  } = {}): TimeSummary {
    return TimeSummary.create({
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    });
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
