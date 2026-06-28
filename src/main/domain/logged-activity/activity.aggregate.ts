// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { normalizeDuration } from "../../../shared/domain/temporal";

export type ActivityState = {
  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;
  // TODO add cycle time
};

export function mergeCategories(
  activities: ActivityState[],
  categories: string[],
): ActivityState[] {
  const merged: ActivityState[] = [];
  for (const activity of activities) {
    mergeActivity(merged, activity, categories);
  }
  return merged;
}

function mergeActivity(
  activities: ActivityState[],
  activity: ActivityState,
  categories: string[],
) {
  if (!filterCategory(categories)(activity)) {
    return;
  }

  const index = activities.findIndex(
    (a) =>
      a.client === activity.client &&
      a.project === activity.project &&
      a.task === activity.task,
  );
  if (index == -1) {
    activities.push(activity);
  } else {
    const existingActivity = activities[index]!;
    const start =
      Temporal.PlainDate.compare(activity.start, existingActivity.start) < 0
        ? activity.start
        : existingActivity.start;
    const finish =
      Temporal.PlainDate.compare(activity.finish, existingActivity.finish) > 0
        ? activity.finish
        : existingActivity.finish;
    activities[index] = {
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      hours: normalizeDuration(activity.hours.add(existingActivity.hours)),
    };
  }
}

const NO_CATEGORY = "";

export function filterCategory(categories: string[]) {
  return (activity: ActivityState) =>
    categories.length === 0 ||
    categories.includes(activity.category ?? NO_CATEGORY);
}
