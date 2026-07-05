// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type RecentActivity } from "./recent_activity.value_object";

export interface WorkingDay {
  readonly date: Temporal.PlainDateLike;
  readonly activities: RecentActivity[];
}

export function createWorkingDay({
  date,
  activities = [],
}: {
  date: Temporal.PlainDateLike;
  activities?: RecentActivity[];
}): WorkingDay {
  return { date, activities };
}

export function compareWorkingDay(a: WorkingDay, b: WorkingDay) {
  return Temporal.PlainDate.compare(a.date, b.date);
}
