// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Failure, Success } from "@muspellheim/shared";

import {
  Activity,
  Capacity,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  type Scope,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/activities";

//
// Commands
//

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

//
// Queries
//

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
    return new RecentActivitiesQueryResultDto(dto.workingDays, dto.timeSummary);
  }

  static from(
    model: RecentActivitiesQueryResult,
  ): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(
      model.workingDays.map((workingDay) => WorkingDayDto.from(workingDay)),
      TimeSummaryDto.from(model.timeSummary),
    );
  }

  readonly workingDays: WorkingDayDto[];
  readonly timeSummary: TimeSummaryDto;

  constructor(workingDays: WorkingDayDto[], timeSummary: TimeSummaryDto) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }

  validate() {
    return new RecentActivitiesQueryResult(
      this.workingDays.map((workingDay) =>
        WorkingDayDto.create(workingDay).validate(),
      ),
      TimeSummaryDto.create(this.timeSummary).validate(),
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

export class ReportQueryDto {
  static create(dto: ReportQueryDto): ReportQueryDto {
    return new ReportQueryDto(dto.scope, dto.from, dto.to, dto.timeZone);
  }

  static from(model: ReportQuery): ReportQueryDto {
    return new ReportQueryDto(
      model.scope,
      model.from?.toString(),
      model.to?.toString(),
      model.timeZone?.toString(),
    );
  }

  readonly scope: Scope;
  readonly from?: string;
  readonly to?: string;
  readonly timeZone?: string;

  constructor(scope: Scope, from?: string, to?: string, timeZone?: string) {
    this.scope = scope;
    this.from = from;
    this.to = to;
    this.timeZone = timeZone;
  }

  validate(): ReportQuery {
    return new ReportQuery(this.scope, this.from, this.to, this.timeZone);
  }
}

export class ReportQueryResultDto {
  static create(dto: ReportQueryResultDto) {
    return new ReportQueryResultDto(dto.entries, dto.totalHours);
  }

  static from(model: ReportQueryResult): ReportQueryResultDto {
    return new ReportQueryResultDto(
      model.entries.map((entry) => ReportEntryDto.from(entry)),
      model.totalHours.toString(),
    );
  }

  readonly entries: ReportEntryDto[];
  readonly totalHours: string;

  constructor(entries: ReportEntryDto[], totalHours: string) {
    this.entries = entries;
    this.totalHours = totalHours;
  }

  validate(): ReportQueryResult {
    return new ReportQueryResult(
      this.entries.map((entry) => ReportEntryDto.create(entry).validate()),
      this.totalHours,
    );
  }
}

export class ReportEntryDto {
  static create(dto: ReportEntryDto): ReportEntryDto {
    return new ReportEntryDto(dto.name, dto.hours, dto.client);
  }

  static from(model: ReportEntry): ReportEntryDto {
    return new ReportEntryDto(model.name, model.hours.toString(), model.client);
  }

  readonly name: string;
  readonly hours: string;
  readonly client?: string;

  constructor(name: string, hours: string, client?: string) {
    this.name = name;
    this.hours = hours;
    this.client = client;
  }

  validate(): ReportEntry {
    return new ReportEntry(
      this.name,
      Temporal.Duration.from(this.hours),
      this.client,
    );
  }
}

export class TimesheetQueryDto {
  static create(dto: TimesheetQueryDto): TimesheetQueryDto {
    return new TimesheetQueryDto(dto.from, dto.to, dto.timeZone);
  }

  static from(model: TimesheetQuery): TimesheetQueryDto {
    return new TimesheetQueryDto(
      model.from.toString(),
      model.to.toString(),
      model.timeZone?.toString(),
    );
  }

  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;

  constructor(from: string, to: string, timeZone?: string) {
    this.from = from;
    this.to = to;
    this.timeZone = timeZone;
  }

  validate(): TimesheetQuery {
    return new TimesheetQuery(this.from, this.to, this.timeZone);
  }
}

export class TimesheetQueryResultDto {
  static create(dto: TimesheetQueryResultDto) {
    return new TimesheetQueryResultDto(
      dto.entries,
      dto.totalHours,
      dto.capacity,
    );
  }

  static from(model: TimesheetQueryResult): TimesheetQueryResultDto {
    return new TimesheetQueryResultDto(
      model.entries.map((entry) => TimesheetEntryDto.from(entry)),
      model.totalHours.toString(),
      CapacityDto.from(model.capacity),
    );
  }

  readonly entries: TimesheetEntryDto[];
  readonly totalHours: string;
  readonly capacity: CapacityDto;

  constructor(
    entries: TimesheetEntryDto[],
    totalHours: string,
    capacity: CapacityDto,
  ) {
    this.entries = entries;
    this.totalHours = totalHours;
    this.capacity = capacity;
  }

  validate(): TimesheetQueryResult {
    return new TimesheetQueryResult(
      this.entries.map((entry) => TimesheetEntryDto.create(entry).validate()),
      Temporal.Duration.from(this.totalHours),
      CapacityDto.create(this.capacity).validate(),
    );
  }
}

export class TimesheetEntryDto {
  static create(dto: TimesheetEntryDto): TimesheetEntryDto {
    return new TimesheetEntryDto(
      dto.date,
      dto.client,
      dto.project,
      dto.task,
      dto.hours,
    );
  }

  static from(model: TimesheetEntry): TimesheetEntryDto {
    return new TimesheetEntryDto(
      model.date.toString(),
      model.client,
      model.project,
      model.task,
      model.hours.toString(),
    );
  }

  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: string;

  constructor(
    date: string,
    client: string,
    project: string,
    task: string,
    hours: string,
  ) {
    this.date = date;
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = hours;
  }

  validate(): TimesheetEntry {
    return new TimesheetEntry(
      this.date,
      this.client,
      this.project,
      this.task,
      this.hours,
    );
  }
}

export class CapacityDto {
  static create(dto: CapacityDto): CapacityDto {
    return new CapacityDto(dto.hours, dto.offset);
  }

  static from(model: Capacity): CapacityDto {
    return new CapacityDto(model.hours.toString(), model.offset.toString());
  }

  readonly hours: string;
  readonly offset: string;

  constructor(hours: string, offset: string) {
    this.hours = hours;
    this.offset = offset;
  }

  validate(): Capacity {
    return new Capacity(this.hours, this.offset);
  }
}
