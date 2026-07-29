// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type ActivityState = Readonly<{
  start: Temporal.PlainDateLike;
  finish: Temporal.PlainDateLike;
  client: string;
  project: string;
  task: string;
  category?: string;
  hours: Temporal.DurationLike;
  cycleTime: number;
}>;

export function createActivity({
  start,
  finish,
  client,
  project,
  task,
  category,
  hours,
}: {
  start: Temporal.PlainDateLike;
  finish: Temporal.PlainDateLike;
  client: string;
  project: string;
  task: string;
  category?: string;
  hours: Temporal.DurationLike;
}): ActivityState {
  hours = normalizeDuration(hours);
  const cycleTime =
    Temporal.PlainDate.from(finish)
      .since(Temporal.PlainDate.from(start))
      .total({ unit: "days" }) + 1;
  return { start, finish, client, project, task, category, hours, cycleTime };
}

export function selectDistinctCategories(
  activities: ActivityState[],
  categories: string[],
): ActivityState[] {
  const merged: ActivityState[] = [];
  for (const activity of activities) {
    selectDistinctCategory(merged, activity, categories);
  }
  return merged;
}

function selectDistinctCategory(
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
      hours: Temporal.Duration.from(activity.hours).add(existingActivity.hours),
      cycleTime:
        Temporal.PlainDate.from(activity.finish)
          .since(activity.start)
          .total("days") + 1,
    };
  }
}

const NO_CATEGORY = "";

function normalizeDuration(duration: Temporal.DurationLike) {
  return Temporal.Duration.from(duration)
    .round({ smallestUnit: "minute", largestUnit: "hour" })
    .toString();
}

function filterCategory(categories: string[]) {
  return (activity: ActivityState) =>
    categories.length === 0 ||
    categories.includes(activity.category ?? NO_CATEGORY);
}
