// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/recent_activities_query";
import { ActivityLoggedEventDto } from "./activities";

export class RecentActivitiesQueryDto {
  static create({
    today,
    timeZone,
  }: {
    today?: string;
    timeZone?: string;
  }): RecentActivitiesQueryDto {
    return new RecentActivitiesQueryDto(today, timeZone);
  }

  static fromModel(model: RecentActivitiesQuery): RecentActivitiesQueryDto {
    return RecentActivitiesQueryDto.create({
      today: model.today?.toString(),
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly today?: string;
  readonly timeZone?: string;

  private constructor(today?: string, timeZone?: string) {
    this.today = today;
    this.timeZone = timeZone;
  }

  validate() {
    return RecentActivitiesQuery.create(this);
  }
}

export class RecentActivitiesQueryResultDto {
  static create({
    workingDays,
    timeSummary,
  }: {
    workingDays: WorkingDayDto[];
    timeSummary: TimeSummaryDto;
  }): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(workingDays, timeSummary);
  }

  static fromModel(
    model: RecentActivitiesQueryResult,
  ): RecentActivitiesQueryResultDto {
    return RecentActivitiesQueryResultDto.create({
      workingDays: model.workingDays.map((workingDay) =>
        WorkingDayDto.from(workingDay),
      ),
      timeSummary: TimeSummaryDto.from(model.timeSummary),
    });
  }

  readonly workingDays: WorkingDayDto[];
  readonly timeSummary: TimeSummaryDto;

  private constructor(
    workingDays: WorkingDayDto[],
    timeSummary: TimeSummaryDto,
  ) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }

  validate() {
    return RecentActivitiesQueryResult.create({
      workingDays: this.workingDays.map((workingDay) =>
        WorkingDayDto.create(workingDay).validate(),
      ),
      timeSummary: TimeSummaryDto.create(this.timeSummary).validate(),
    });
  }
}

export class WorkingDayDto {
  static create({
    date,
    activities,
  }: {
    date: string;
    activities: ActivityLoggedEventDto[];
  }): WorkingDayDto {
    return new WorkingDayDto(date, activities);
  }

  static from(model: WorkingDay): WorkingDayDto {
    return WorkingDayDto.create({
      date: model.date.toString(),
      activities: model.activities.map(
        (activity) => ActivityLoggedEventDto.from(activity)!,
      ),
    });
  }

  readonly date: string;
  readonly activities: ActivityLoggedEventDto[];

  private constructor(date: string, activities: ActivityLoggedEventDto[]) {
    this.date = date;
    this.activities = activities;
  }

  validate(): WorkingDay {
    return WorkingDay.create({
      date: Temporal.PlainDate.from(this.date),
      activities: this.activities.map((dto) =>
        ActivityLoggedEventDto.create(dto)!.validate(),
      ),
    });
  }
}

export class TimeSummaryDto {
  static create({
    hoursToday,
    hoursYesterday,
    hoursThisWeek,
    hoursThisMonth,
  }: {
    hoursToday: string;
    hoursYesterday: string;
    hoursThisWeek: string;
    hoursThisMonth: string;
  }): TimeSummaryDto {
    return new TimeSummaryDto(
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  static from(model: TimeSummary): TimeSummaryDto {
    return TimeSummaryDto.create({
      hoursToday: model.hoursToday.toString(),
      hoursYesterday: model.hoursYesterday.toString(),
      hoursThisWeek: model.hoursThisWeek.toString(),
      hoursThisMonth: model.hoursThisMonth.toString(),
    });
  }

  readonly hoursToday: string;
  readonly hoursYesterday: string;
  readonly hoursThisWeek: string;
  readonly hoursThisMonth: string;

  private constructor(
    hoursToday: string,
    hoursYesterday: string,
    hoursThisWeek: string,
    hoursThisMonth: string,
  ) {
    this.hoursToday = hoursToday;
    this.hoursYesterday = hoursYesterday;
    this.hoursThisWeek = hoursThisWeek;
    this.hoursThisMonth = hoursThisMonth;
  }

  validate(): TimeSummary {
    return TimeSummary.create({
      hoursToday: Temporal.Duration.from(this.hoursToday),
      hoursYesterday: Temporal.Duration.from(this.hoursYesterday),
      hoursThisWeek: Temporal.Duration.from(this.hoursThisWeek),
      hoursThisMonth: Temporal.Duration.from(this.hoursThisMonth),
    });
  }
}
