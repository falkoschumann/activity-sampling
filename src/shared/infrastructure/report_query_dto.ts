// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  type ReportScopeType,
} from "../domain/report_query";

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
