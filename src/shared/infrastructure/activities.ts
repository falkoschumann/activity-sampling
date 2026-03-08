// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Failure, Success } from "@muspellheim/shared";

import {
  ActivityLoggedEvent,
  Capacity,
  LogActivityCommand,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  type ReportScopeType,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../domain/activities";
import { ExportTimesheetCommand } from "../domain/export_timesheet_command";

// region Commands

export class LogActivityCommandDto {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    timestamp: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): LogActivityCommandDto {
    return new LogActivityCommandDto(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static fromModel(model: LogActivityCommand): LogActivityCommandDto {
    return LogActivityCommandDto.create({
      timestamp: model.timestamp.toString(),
      duration: model.duration.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      notes: model.notes,
      category: model.category,
    });
  }

  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    timestamp: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }

  validate(): LogActivityCommand {
    return LogActivityCommand.create(this);
  }
}

export class ExportTimesheetCommandDto {
  static create({
    timesheets,
    fileName,
  }: {
    timesheets: TimesheetEntryDto[];
    fileName: string;
  }): ExportTimesheetCommandDto {
    return new ExportTimesheetCommandDto(timesheets, fileName);
  }

  static fromModel(model: ExportTimesheetCommand): ExportTimesheetCommandDto {
    return ExportTimesheetCommandDto.create({
      timesheets: model.timesheets.map((entry) =>
        TimesheetEntryDto.from(entry),
      ),
      fileName: model.fileName,
    });
  }

  readonly timesheets: TimesheetEntryDto[];
  readonly fileName: string;

  private constructor(timesheets: TimesheetEntryDto[], fileName: string) {
    this.timesheets = timesheets;
    this.fileName = fileName;
  }

  validate(): ExportTimesheetCommand {
    return ExportTimesheetCommand.create({
      timesheets: this.timesheets.map((dto) =>
        TimesheetEntryDto.create(dto).validate(),
      ),
      fileName: this.fileName,
    });
  }
}

export class CommandStatusDto {
  static create({
    isSuccess,
    errorMessage,
  }: {
    isSuccess: boolean;
    errorMessage?: string;
  }): CommandStatusDto {
    return new CommandStatusDto(isSuccess, errorMessage);
  }

  static fromModel(model: CommandStatus): CommandStatusDto {
    if (model.isSuccess) {
      return new CommandStatusDto(true);
    }

    return CommandStatusDto.create({
      isSuccess: model.isSuccess,
      errorMessage: model.errorMessage,
    });
  }

  readonly isSuccess: boolean;
  readonly errorMessage?: string;

  private constructor(isSuccess: boolean, errorMessage?: string) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
  }

  validate(): CommandStatus {
    return this.isSuccess ? new Success() : new Failure(this.errorMessage!);
  }
}

// endregion

// region Queries

export class ReportQueryDto {
  static create({
    scope,
    from,
    to,
    timeZone,
  }: {
    scope: ReportScopeType;
    from?: string;
    to?: string;
    timeZone?: string;
  }): ReportQueryDto {
    return new ReportQueryDto(scope, from, to, timeZone);
  }

  static fromModel(model: ReportQuery): ReportQueryDto {
    return ReportQueryDto.create({
      scope: model.scope,
      from: model.from?.toString(),
      to: model.to?.toString(),
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly scope: ReportScopeType;
  readonly from?: string;
  readonly to?: string;
  readonly timeZone?: string;

  private constructor(
    scope: ReportScopeType,
    from?: string,
    to?: string,
    timeZone?: string,
  ) {
    this.scope = scope;
    this.from = from;
    this.to = to;
    this.timeZone = timeZone;
  }

  validate(): ReportQuery {
    return ReportQuery.create(this);
  }
}

export class ReportQueryResultDto {
  static create({
    entries,
    totalHours,
  }: {
    entries: ReportEntryDto[];
    totalHours: string;
  }) {
    return new ReportQueryResultDto(entries, totalHours);
  }

  static fromModel(model: ReportQueryResult): ReportQueryResultDto {
    return ReportQueryResultDto.create({
      entries: model.entries.map((entry) => ReportEntryDto.from(entry)),
      totalHours: model.totalHours.toString(),
    });
  }

  readonly entries: ReportEntryDto[];
  readonly totalHours: string;

  private constructor(entries: ReportEntryDto[], totalHours: string) {
    this.entries = entries;
    this.totalHours = totalHours;
  }

  validate(): ReportQueryResult {
    return ReportQueryResult.create({
      entries: this.entries.map((entry) =>
        ReportEntryDto.create(entry).validate(),
      ),
      totalHours: this.totalHours,
    });
  }
}

export class ReportEntryDto {
  static create({
    start,
    finish,
    client,
    project,
    task,
    category,
    hours,
    cycleTime,
  }: {
    start: string;
    finish: string;
    client: string;
    project: string;
    task: string;
    category: string;
    hours: string;
    cycleTime: number;
  }): ReportEntryDto {
    return new ReportEntryDto(
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

  static from(model: ReportEntry): ReportEntryDto {
    return ReportEntryDto.create({
      start: model.start.toString(),
      finish: model.finish.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      category: model.category,
      hours: model.hours.toString(),
      cycleTime: model.cycleTime,
    });
  }

  readonly start: string;
  readonly finish: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category: string;
  readonly hours: string;
  readonly cycleTime: number;

  private constructor(
    start: string,
    finish: string,
    client: string,
    project: string,
    task: string,
    category: string,
    hours: string,
    cycleTime: number,
  ) {
    this.start = start;
    this.finish = finish;
    this.client = client;
    this.project = project;
    this.task = task;
    this.category = category;
    this.hours = hours;
    this.cycleTime = cycleTime;
  }

  validate(): ReportEntry {
    return ReportEntry.create(this);
  }
}

export class TimesheetQueryDto {
  static create({
    from,
    to,
    today,
    timeZone,
  }: {
    from: string;
    to: string;
    today?: string;
    timeZone?: string;
  }): TimesheetQueryDto {
    return new TimesheetQueryDto(from, to, today, timeZone);
  }

  static fromModel(model: TimesheetQuery): TimesheetQueryDto {
    return TimesheetQueryDto.create({
      from: model.from.toString(),
      to: model.to.toString(),
      today: model.today?.toString(),
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly from: string;
  readonly to: string;
  readonly today?: string;
  readonly timeZone?: string;

  private constructor(
    from: string,
    to: string,
    today?: string,
    timeZone?: string,
  ) {
    this.from = from;
    this.to = to;
    this.today = today;
    this.timeZone = timeZone;
  }

  validate(): TimesheetQuery {
    return TimesheetQuery.create(this);
  }
}

export class TimesheetQueryResultDto {
  static create({
    entries,
    totalHours,
    capacity,
  }: {
    entries: TimesheetEntryDto[];
    totalHours: string;
    capacity: CapacityDto;
  }) {
    return new TimesheetQueryResultDto(entries, totalHours, capacity);
  }

  static fromModel(model: TimesheetQueryResult): TimesheetQueryResultDto {
    return TimesheetQueryResultDto.create({
      entries: model.entries.map((entry) => TimesheetEntryDto.from(entry)),
      totalHours: model.totalHours.toString(),
      capacity: CapacityDto.from(model.capacity),
    });
  }

  readonly entries: TimesheetEntryDto[];
  readonly totalHours: string;
  readonly capacity: CapacityDto;

  private constructor(
    entries: TimesheetEntryDto[],
    totalHours: string,
    capacity: CapacityDto,
  ) {
    this.entries = entries;
    this.totalHours = totalHours;
    this.capacity = capacity;
  }

  validate(): TimesheetQueryResult {
    return TimesheetQueryResult.create({
      entries: this.entries.map((entry) =>
        TimesheetEntryDto.create(entry).validate(),
      ),
      totalHours: Temporal.Duration.from(this.totalHours),
      capacity: CapacityDto.create(this.capacity).validate(),
    });
  }
}

export class TimesheetEntryDto {
  static create({
    date,
    client,
    project,
    task,
    hours,
  }: {
    date: string;
    client: string;
    project: string;
    task: string;
    hours: string;
  }): TimesheetEntryDto {
    return new TimesheetEntryDto(date, client, project, task, hours);
  }

  static from(model: TimesheetEntry): TimesheetEntryDto {
    return TimesheetEntryDto.create({
      date: model.date.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      hours: model.hours.toString(),
    });
  }

  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: string;

  private constructor(
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
    return TimesheetEntry.create(this);
  }
}

export class CapacityDto {
  static create({
    hours,
    offset,
  }: {
    hours: string;
    offset: string;
  }): CapacityDto {
    return new CapacityDto(hours, offset);
  }

  static from(model: Capacity): CapacityDto {
    return CapacityDto.create({
      hours: model.hours.toString(),
      offset: model.offset.toString(),
    });
  }

  readonly hours: string;
  readonly offset: string;

  private constructor(hours: string, offset: string) {
    this.hours = hours;
    this.offset = offset;
  }

  validate(): Capacity {
    return Capacity.create(this);
  }
}

// endregion

// region Events

export class ActivityLoggedEventDto {
  static create(dto: {
    dateTime: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): ActivityLoggedEventDto {
    return new ActivityLoggedEventDto(
      dto.dateTime,
      dto.duration,
      dto.client,
      dto.project,
      dto.task,
      dto.notes,
      dto.category,
    );
  }

  static from(model: ActivityLoggedEvent): ActivityLoggedEventDto {
    return ActivityLoggedEventDto.create({
      dateTime: model.dateTime.toString(),
      duration: model.duration.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      notes: model.notes,
      category: model.category,
    });
  }

  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    dateTime: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.dateTime = dateTime;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }

  validate(): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      dateTime: Temporal.PlainDateTime.from(this.dateTime),
      duration: Temporal.Duration.from(this.duration),
      client: this.client,
      project: this.project,
      task: this.task,
      notes: this.notes,
      category: this.category,
    });
  }
}
