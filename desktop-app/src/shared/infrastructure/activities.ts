// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Failure, Success } from "@muspellheim/shared";

import {
  Activity,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/activities";

export class LogActivityCommandDto {
  static create(dto: LogActivityCommandDto): LogActivityCommandDto {
    return new LogActivityCommandDto(
      dto.timestamp,
      dto.duration,
      dto.client,
      dto.project,
      dto.task,
      dto.notes,
    );
  }

  static from(model: LogActivityCommand): LogActivityCommandDto {
    return new LogActivityCommandDto(
      model.timestamp.toString(),
      model.duration.toString(),
      model.client,
      model.project,
      model.task,
      model.notes,
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
  static create(dto: CommandStatusDto): CommandStatusDto {
    return new CommandStatusDto(dto.isSuccess, dto.errorMessage);
  }

  static from(model: CommandStatus): CommandStatusDto {
    if (model.isSuccess) {
      return new CommandStatusDto(true);
    }

    return new CommandStatusDto(model.isSuccess, model.errorMessage);
  }

  readonly isSuccess: boolean;
  readonly errorMessage?: string;

  constructor(isSuccess: boolean, errorMessage?: string) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
  }

  validate(): CommandStatus {
    return this.isSuccess ? new Success() : new Failure(this.errorMessage!);
  }
}

export class RecentActivitiesQueryDto {
  static create(dto: RecentActivitiesQueryDto): RecentActivitiesQueryDto {
    return new RecentActivitiesQueryDto(dto.timeZone);
  }

  static from(model: RecentActivitiesQuery): RecentActivitiesQueryDto {
    return new RecentActivitiesQueryDto(model.timeZone?.toString());
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
  static create(
    dto: RecentActivitiesQueryResultDto,
  ): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(
      dto.workingDays,
      dto.timeSummary,
      dto.lastActivity,
    );
  }

  static from(
    model: RecentActivitiesQueryResult,
  ): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(
      model.workingDays.map((workingDay) => WorkingDayDto.from(workingDay)),
      TimeSummaryDto.from(model.timeSummary),
      ActivityDto.from(model.lastActivity),
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
      this.workingDays.map((workingDay) =>
        WorkingDayDto.create(workingDay).validate(),
      ),
      TimeSummaryDto.create(this.timeSummary).validate(),
      ActivityDto.create(this.lastActivity)?.validate(),
    );
  }
}

export class WorkingDayDto {
  static create(workingDay: WorkingDayDto): WorkingDayDto {
    return new WorkingDayDto(workingDay.date, workingDay.activities);
  }

  static from(model: WorkingDay): WorkingDayDto {
    return new WorkingDayDto(
      model.date.toString(),
      model.activities.map((activity) => ActivityDto.from(activity)!),
    );
  }

  readonly date: string;
  readonly activities: ActivityDto[];

  constructor(date: string, activities: ActivityDto[]) {
    this.date = date;
    this.activities = activities;
  }

  validate(): WorkingDay {
    return new WorkingDay(
      Temporal.PlainDate.from(this.date),
      this.activities.map((dto) => ActivityDto.create(dto)!.validate()),
    );
  }
}

export class TimeSummaryDto {
  static create(dto: TimeSummaryDto): TimeSummaryDto {
    return new TimeSummaryDto(
      dto.hoursToday,
      dto.hoursYesterday,
      dto.hoursThisWeek,
      dto.hoursThisMonth,
    );
  }

  static from(model: TimeSummary): TimeSummaryDto {
    return new TimeSummaryDto(
      model.hoursToday.toString(),
      model.hoursYesterday.toString(),
      model.hoursThisWeek.toString(),
      model.hoursThisMonth.toString(),
    );
  }

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
  static create(dto?: ActivityDto): ActivityDto | undefined {
    if (dto == null) {
      return;
    }

    return new ActivityDto(
      dto.dateTime,
      dto.duration,
      dto.client,
      dto.project,
      dto.task,
      dto.notes,
    );
  }

  static from(model?: Activity): ActivityDto | undefined {
    if (!model) {
      return;
    }

    return new ActivityDto(
      model.dateTime.toString(),
      model.duration.toString(),
      model.client,
      model.project,
      model.task,
      model.notes,
    );
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
