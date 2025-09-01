// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { CommandStatus } from "../common/messages";
import {
  Activity,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/activities";

export class LogActivityCommandDto {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
  }: {
    timestamp: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
  }): LogActivityCommandDto {
    return new LogActivityCommandDto(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  static from(command: LogActivityCommand): LogActivityCommandDto {
    return new LogActivityCommandDto(
      command.timestamp.toString(),
      command.duration.toString(),
      command.client,
      command.project,
      command.task,
      command.notes,
    );
  }

  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(
    timestamp: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }

  validate(): LogActivityCommand {
    return new LogActivityCommand(
      this.timestamp,
      this.duration,
      this.client,
      this.project,
      this.task,
      this.notes,
    );
  }
}

export class CommandStatusDto {
  static create({
    success,
    errorMessage,
  }: {
    success: boolean;
    errorMessage?: string;
  }): CommandStatusDto {
    return new CommandStatusDto(success, errorMessage);
  }

  static from(status: CommandStatus): CommandStatusDto {
    return new CommandStatusDto(status.success, status.errorMessage);
  }

  readonly success: boolean;
  readonly errorMessage?: string;

  constructor(success: boolean, errorMessage?: string) {
    this.success = success;
    this.errorMessage = errorMessage;
  }

  validate(): CommandStatus {
    return new CommandStatus(this.success, this.errorMessage);
  }
}

export class RecentActivitiesQueryDto {
  static create({
    timeZone,
  }: { timeZone?: string } = {}): RecentActivitiesQueryDto {
    return new RecentActivitiesQueryDto(timeZone);
  }

  static from(query: RecentActivitiesQuery): RecentActivitiesQueryDto {
    return new RecentActivitiesQueryDto(query.timeZone?.toString());
  }

  readonly timeZone?: string;

  constructor(timeZone?: string) {
    this.timeZone = timeZone;
  }

  validate() {
    return new RecentActivitiesQuery(this.timeZone);
  }
}

export class RecentActivitiesQueryResultDto {
  static create({
    workingDays,
    timeSummary,
    lastActivity,
  }: {
    workingDays: WorkingDayDto[];
    timeSummary: TimeSummaryDto;
    lastActivity?: ActivityDto;
  }): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(
      workingDays,
      timeSummary,
      lastActivity,
    );
  }

  static from(
    result: RecentActivitiesQueryResult,
  ): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(
      result.workingDays.map(
        (workingDay) =>
          new WorkingDayDto(
            workingDay.date.toString(),
            workingDay.activities.map(
              (activity) =>
                new ActivityDto(
                  activity.dateTime.toString(),
                  activity.duration.toString(),
                  activity.client,
                  activity.project,
                  activity.task,
                  activity.notes,
                ),
            ),
          ),
      ),
      new TimeSummaryDto(
        result.timeSummary.hoursToday.toString(),
        result.timeSummary.hoursYesterday.toString(),
        result.timeSummary.hoursThisWeek.toString(),
        result.timeSummary.hoursThisMonth.toString(),
      ),
      result.lastActivity
        ? new ActivityDto(
            result.lastActivity.dateTime.toString(),
            result.lastActivity.duration.toString(),
            result.lastActivity.client,
            result.lastActivity.project,
            result.lastActivity.task,
            result.lastActivity.notes,
          )
        : undefined,
    );
  }

  readonly workingDays: WorkingDayDto[];
  readonly timeSummary: TimeSummaryDto;
  readonly lastActivity?: ActivityDto;

  constructor(
    workingDays: WorkingDayDto[],
    timeSummary: TimeSummaryDto,
    lastActivity?: ActivityDto,
  ) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
    this.lastActivity = lastActivity;
  }

  validate() {
    return new RecentActivitiesQueryResult(
      this.workingDays.map((workingDay) => workingDay.validate()),
      this.timeSummary.validate(),
      this.lastActivity?.validate(),
    );
  }
}

export class WorkingDayDto {
  readonly date: string;
  readonly activities: ActivityDto[];

  constructor(date: string, activities: ActivityDto[]) {
    this.date = date;
    this.activities = activities;
  }

  validate(): WorkingDay {
    return new WorkingDay(
      Temporal.PlainDate.from(this.date),
      this.activities.map((activity) => activity.validate()),
    );
  }
}

export class TimeSummaryDto {
  readonly hoursToday: string;
  readonly hoursYesterday: string;
  readonly hoursThisWeek: string;
  readonly hoursThisMonth: string;

  constructor(
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
    return new TimeSummary(
      Temporal.Duration.from(this.hoursToday),
      Temporal.Duration.from(this.hoursYesterday),
      Temporal.Duration.from(this.hoursThisWeek),
      Temporal.Duration.from(this.hoursThisMonth),
    );
  }
}

export class ActivityDto {
  static create({
    dateTime,
    duration,
    client,
    project,
    task,
    notes,
  }: {
    dateTime: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
  }): ActivityDto {
    return new ActivityDto(dateTime, duration, client, project, task, notes);
  }

  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(
    dateTime: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
  ) {
    this.dateTime = dateTime;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }

  validate(): Activity {
    return new Activity(
      Temporal.PlainDateTime.from(this.dateTime),
      Temporal.Duration.from(this.duration),
      this.client,
      this.project,
      this.task,
      this.notes,
    );
  }
}
