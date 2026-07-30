// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimesheetEntry {
  readonly date: Temporal.PlainDateLike;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.DurationLike;
}

export function createTimesheetEntry({
  date,
  client,
  project,
  task,
  category,
  hours,
}: {
  date: Temporal.PlainDateLike;
  client: string;
  project: string;
  task: string;
  category?: string;
  hours: Temporal.DurationLike;
}): TimesheetEntry {
  return { date, client, project, task, category, hours };
}

export function compareTimesheetEntry(a: TimesheetEntry, b: TimesheetEntry) {
  const dateComparison = Temporal.PlainDate.compare(a.date, b.date);
  if (dateComparison !== 0) {
    return dateComparison;
  } else if (a.client !== b.client) {
    return a.client.localeCompare(b.client);
  } else if (a.project !== b.project) {
    return a.project.localeCompare(b.project);
  } else if (a.category !== b.category) {
    return (a.category ?? "").localeCompare(b.category ?? "");
  } else return a.task.localeCompare(b.task);
}
