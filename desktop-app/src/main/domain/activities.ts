// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface LogActivityCommand {
  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export function createTestLogActivityCommand({
  timestamp = "2025-08-11T12:30:00Z",
  duration = "PT30M",
  client = "Test client",
  project = "Test project",
  task = "Test task",
  notes,
}: Partial<LogActivityCommand> = {}): LogActivityCommand {
  return { timestamp, duration, client, project, task, notes };
}

export interface Activity {
  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export function createTestActivity({
  dateTime = "2025-08-11T14:30",
  duration = "PT30M",
  client = "Test client",
  project = "Test project",
  task = "Test task",
  notes,
}: Partial<Activity> = {}): Activity {
  return { dateTime, duration, client, project, task, notes };
}
