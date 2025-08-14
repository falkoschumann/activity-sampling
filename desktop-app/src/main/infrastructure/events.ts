// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class ActivityLoggedEvent {
  static createTestData({
    timestamp = "2025-08-11T12:30:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
  }: Partial<ActivityLoggedEvent> = {}): ActivityLoggedEvent {
    return { timestamp, duration, client, project, task, notes };
  }

  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(data: ActivityLoggedEvent) {
    this.timestamp = data.timestamp;
    this.duration = data.duration;
    this.client = data.client;
    this.project = data.project;
    this.task = data.task;
    this.notes = data.notes;
  }
}
