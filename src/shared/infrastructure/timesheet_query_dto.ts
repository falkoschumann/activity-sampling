// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  Capacity,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../domain/timesheet_query";

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
