// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class RecentActivity {
  static compare(a: RecentActivity, b: RecentActivity) {
    return Temporal.PlainTime.compare(a.time, b.time);
  }

  static create({
    time,
    client,
    project,
    task,
    notes,
    category,
  }: {
    time: Temporal.PlainTimeLike;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }) {
    return new RecentActivity(time, client, project, task, notes, category);
  }

  static createTestInstance({
    time = "13:00",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
  }: {
    time?: Temporal.PlainTimeLike;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
  } = {}) {
    return RecentActivity.create({
      time,
      client,
      project,
      task,
      notes,
      category,
    });
  }

  readonly time;
  readonly client;
  readonly project;
  readonly task;
  readonly notes;
  readonly category;

  private constructor(
    time: Temporal.PlainTimeLike,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.time = Temporal.PlainTime.from(time);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }
}
