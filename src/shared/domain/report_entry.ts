// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

// TODO Replace with activity state?

export class ReportEntry {
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
    start: Temporal.PlainDateLike;
    finish: Temporal.PlainDateLike;
    client?: string;
    project?: string;
    task?: string;
    category?: string;
    hours: Temporal.DurationLike;
    cycleTime: number;
  }) {
    return new ReportEntry(
      start,
      finish,
      hours,
      cycleTime,
      client,
      project,
      task,
      category,
    );
  }

  static createTestInstance({
    start = Temporal.PlainDate.from("2025-11-19"),
    finish = Temporal.PlainDate.from("2025-11-19"),
    client = "Test client",
    project,
    task,
    category,
    hours = Temporal.Duration.from("PT8H"),
    cycleTime = 1,
  }: {
    start?: Temporal.PlainDateLike;
    finish?: Temporal.PlainDateLike;
    client?: string;
    project?: string;
    task?: string;
    category?: string;
    hours?: Temporal.DurationLike;
    cycleTime?: number;
  } = {}) {
    return ReportEntry.create({
      start,
      finish,
      client,
      project,
      task,
      category,
      hours,
      cycleTime,
    });
  }

  readonly start;
  readonly finish;
  readonly client;
  readonly project;
  readonly task;
  readonly category;
  readonly hours;
  readonly cycleTime;

  private constructor(
    start: Temporal.PlainDateLike,
    finish: Temporal.PlainDateLike,
    hours: Temporal.DurationLike,
    cycleTime: number,
    client?: string,
    project?: string,
    task?: string,
    category?: string,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.category = category;
    this.hours = Temporal.Duration.from(hours);
    this.cycleTime = cycleTime;
  }
}
