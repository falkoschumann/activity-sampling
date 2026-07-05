// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface RecentActivity {
  readonly time: Temporal.PlainTimeLike;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
}

export function createRecentActivity({
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
}): RecentActivity {
  return { time, client, project, task, notes, category };
}

export function compareRecentActivity(a: RecentActivity, b: RecentActivity) {
  return Temporal.PlainTime.compare(a.time, b.time);
}
