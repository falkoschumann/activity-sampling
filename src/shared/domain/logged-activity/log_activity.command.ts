// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class LogActivityCommand {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    timestamp: Temporal.Instant | string;
    duration: Temporal.DurationLike | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }) {
    return new LogActivityCommand(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static createTestInstance({
    timestamp = "2025-08-14T11:00:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
  }: {
    timestamp?: Temporal.Instant | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
  } = {}) {
    return LogActivityCommand.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
    });
  }

  readonly type = "log-activity";
  readonly data;

  private constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.data = {
      timestamp: Temporal.Instant.from(timestamp),
      duration: Temporal.Duration.from(duration),
      client: client,
      project: project,
      task: task,
      notes: notes,
      category: category,
    };
  }
}
