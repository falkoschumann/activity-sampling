// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type ActivityLoggedEvent,
  createActivityLoggedEvent,
} from "./activity_logged.event";

export interface LogActivityCommand {
  readonly type: "log-activity";
  readonly data: LogActivityData;
}

export type LogActivityData = Readonly<{
  timestamp: Temporal.InstantLike;
  duration: Temporal.DurationLike;
  client: string;
  project: string;
  task: string;
  notes?: string;
  category?: string;
}>;

export function createLogActivityCommand({
  timestamp,
  duration,
  client,
  project,
  task,
  notes,
  category,
}: {
  timestamp: Temporal.InstantLike;
  duration: Temporal.DurationLike;
  client: string;
  project: string;
  task: string;
  notes?: string;
  category?: string;
}): LogActivityCommand {
  return {
    type: "log-activity",
    data: { timestamp, duration, client, project, task, notes, category },
  };
}

export function logActivity(
  command: LogActivityCommand,
): ActivityLoggedEvent[] {
  let { timestamp, duration } = command.data;
  timestamp = Temporal.Instant.from(timestamp).round("seconds").toString();
  duration = Temporal.Duration.from(duration).round("minutes").toString();
  return [createActivityLoggedEvent({ ...command.data, timestamp, duration })];
}
