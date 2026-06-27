// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimesheetEntry {
  static create({
    date,
    client,
    project,
    task,
    hours,
  }: {
    date: Temporal.PlainDateLike;
    client: string;
    project: string;
    task: string;
    hours: Temporal.DurationLike;
  }) {
    return new TimesheetEntry(date, client, project, task, hours);
  }

  static createTestInstance({
    date = Temporal.PlainDate.from("2025-06-04"),
    client = "Test client",
    project = "Test project",
    task = "Test task",
    hours = Temporal.Duration.from("PT2H"),
  }: {
    date?: Temporal.PlainDateLike;
    client?: string;
    project?: string;
    task?: string;
    hours?: Temporal.DurationLike;
  } = {}) {
    return TimesheetEntry.create({ date, client, project, task, hours });
  }

  static compare(a: TimesheetEntry, b: TimesheetEntry) {
    const dateComparison = Temporal.PlainDate.compare(a.date, b.date);
    if (dateComparison !== 0) {
      return dateComparison;
    } else if (a.client !== b.client) {
      return a.client.localeCompare(b.client);
    } else if (a.project !== b.project) {
      return a.project.localeCompare(b.project);
    } else return a.task.localeCompare(b.task);
  }

  readonly date;
  readonly client;
  readonly project;
  readonly task;
  readonly hours;

  private constructor(
    date: Temporal.PlainDateLike,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = Temporal.Duration.from(hours);
  }
}
