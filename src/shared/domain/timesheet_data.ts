// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimesheetData {
  static create({
    date,
    client,
    project,
    task,
    notes,
    hours,
    firstName,
    lastName,
  }: {
    date: Temporal.PlainDate | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    hours: number;
    firstName: string;
    lastName: string;
  }) {
    return new TimesheetData(
      date,
      client,
      project,
      task,
      hours,
      firstName,
      lastName,
      notes,
    );
  }

  static createTestInstance({
    date = "2025-06-04",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    hours = 2,
    firstName = "John",
    lastName = "Doe",
  }: {
    date?: Temporal.PlainDate | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    hours?: number;
    firstName?: string;
    lastName?: string;
  } = {}) {
    return TimesheetData.create({
      date,
      client,
      project,
      task,
      notes,
      hours,
      firstName,
      lastName,
    });
  }

  readonly date;
  readonly client;
  readonly project;
  readonly task;
  readonly hours;
  readonly firstName;
  readonly lastName;
  readonly notes;

  constructor(
    date: Temporal.PlainDate | string,
    client: string,
    project: string,
    task: string,
    hours: number,
    firstName: string,
    lastName: string,
    notes?: string,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.hours = hours;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
