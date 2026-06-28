// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimeSummary } from "./time_summary";
import { WorkingDay } from "./working_day";

export class GetRecentActivitiesQuery {
  static create({
    today = Temporal.Now.plainDateISO(),
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    today?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return new GetRecentActivitiesQuery(today, timeZone);
  }

  static createTestInstance({
    today = "2026-03-29T11:56",
    timeZone = "Europe/Berlin",
  }: {
    today?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetRecentActivitiesQuery.create({ today, timeZone });
  }

  readonly type = "get-recent-activities";
  readonly data;

  private constructor(
    today: Temporal.PlainDateLike,
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.data = {
      today: Temporal.PlainDate.from(today),
      timeZone,
    };
  }
}

export class GetRecentActivitiesQueryResult {
  static create({
    workingDays = [],
    timeSummary = TimeSummary.create(),
  }: {
    workingDays?: WorkingDay[];
    timeSummary?: TimeSummary;
  } = {}) {
    return new GetRecentActivitiesQueryResult(workingDays, timeSummary);
  }

  static createTestInstance({
    workingDays = [WorkingDay.createTestInstance()],
    timeSummary = TimeSummary.createTestInstance(),
  }: {
    workingDays?: WorkingDay[];
    timeSummary?: TimeSummary;
  } = {}) {
    return GetRecentActivitiesQueryResult.create({ workingDays, timeSummary });
  }

  readonly workingDays;
  readonly timeSummary;

  private constructor(workingDays: WorkingDay[], timeSummary: TimeSummary) {
    this.workingDays = workingDays.map(WorkingDay.create);
    this.timeSummary = TimeSummary.create(timeSummary);
  }
}
