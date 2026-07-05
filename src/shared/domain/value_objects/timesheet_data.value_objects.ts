// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimesheetData {
  readonly date: Temporal.PlainDateLike;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly notes?: string;
}

export function createTimesheetData({
  date,
  client,
  project,
  task,
  notes,
  hours,
  firstName,
  lastName,
}: {
  date: Temporal.PlainDateLike;
  client: string;
  project: string;
  task: string;
  notes?: string;
  hours: number;
  firstName: string;
  lastName: string;
}): TimesheetData {
  return { date, client, project, task, hours, firstName, lastName, notes };
}
