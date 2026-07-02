// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class ActivityLoggedEvent {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
    category,
    notification,
  }: {
    timestamp: Temporal.InstantLike;
    duration: Temporal.DurationLike;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
    notification?: string;
  }): ActivityLoggedEvent {
    return new ActivityLoggedEvent(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
      notification,
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
    notification,
  }: {
    timestamp?: Temporal.InstantLike;
    duration?: Temporal.DurationLike;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
    notification?: string;
  } = {}): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
      notification,
    });
  }

  readonly type = "activity-logged";
  readonly data;

  private constructor(
    timestamp: Temporal.InstantLike,
    duration: Temporal.DurationLike,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
    notification?: string,
  ) {
    this.data = {
      timestamp: Temporal.Instant.from(timestamp),
      duration: Temporal.Duration.from(duration),
      client,
      project,
      task,
      notes,
      category,
      notification,
    };
  }
}
