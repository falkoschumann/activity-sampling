// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface Activity {
  readonly start: Temporal.PlainDateLike;
  readonly finish: Temporal.PlainDateLike;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.DurationLike;
  readonly cycleTime: number;
}

export function createActivity({
  start,
  finish,
  client,
  project,
  task,
  category,
  hours,
  cycleTime,
}: {
  start: Temporal.PlainDateLike;
  finish: Temporal.PlainDateLike;
  client: string;
  project: string;
  task: string;
  category?: string;
  hours: Temporal.DurationLike;
  cycleTime: number;
}): Activity {
  return { start, finish, client, project, task, category, hours, cycleTime };
}

export const NO_CATEGORY = "";

export function selectDistinctCategories(
  activities: Activity[],
  categories: string[],
): Activity[] {
  const merged: Activity[] = [];
  for (const activity of activities) {
    selectDistinctCategory(merged, activity, categories);
  }
  return merged;
}

function selectDistinctCategory(
  activities: Activity[],
  activity: Activity,
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
      hours: Temporal.Duration.from(activity.hours).add(existingActivity.hours),
      cycleTime:
        Temporal.PlainDate.from(activity.finish)
          .since(activity.start)
          .total("days") + 1,
    };
  }
}

function filterCategory(categories: string[]) {
  return (activity: Activity) =>
    categories.length === 0 ||
    categories.includes(activity.category ?? NO_CATEGORY);
}
