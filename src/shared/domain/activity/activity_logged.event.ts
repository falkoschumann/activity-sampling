// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface ActivityLoggedEvent {
  readonly type: "activity-logged";
  readonly data: ActivityLoggedEventData;
}

export interface ActivityLoggedEventData {
  readonly timestamp: Temporal.InstantLike;
  readonly duration: Temporal.DurationLike;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
  readonly notification: string;
}

export function createActivityLoggedEvent({
  timestamp,
  duration,
  client,
  project,
  task,
  notes,
  category,
  notification = "notifier",
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
  return {
    type: "activity-logged",
    data: {
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
      notification,
    },
  };
}
