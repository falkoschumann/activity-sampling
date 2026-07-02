// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityState } from "./activity/activity.aggregate";
import { ActivityLoggedEvent } from "./activity/activity_logged.event";
import { normalizeDuration } from "./temporal";

export type ReportView = {
  activities: ActivityState[];
  categories: string[];
};

export function createReport(): ReportView {
  return {
    activities: [],
    categories: [],
  };
}

export function projectReport(
  readModel: ReportView,
  event: ActivityLoggedEvent,
  { timeZone }: { timeZone: Temporal.TimeZoneLike },
): ReportView {
  const activities = projectActivities(readModel.activities, event, {
    timeZone,
  });
  const categories = projectCategories(readModel.categories, event);
  return { activities, categories };
}

function projectActivities(
  activities: ActivityState[],
  event: ActivityLoggedEvent,
  { timeZone }: { timeZone: Temporal.TimeZoneLike },
) {
  const index = activities.findIndex(
    (activity) =>
      activity.client === event.data.client &&
      activity.project === event.data.project &&
      activity.task === event.data.task &&
      activity.category == event.data.category,
  );
  const date = event.data.timestamp
    .toZonedDateTimeISO(timeZone)
    .startOfDay()
    .toPlainDate();
  if (index == -1) {
    const newActivity = {
      start: date,
      finish: date,
      client: event.data.client,
      project: event.data.project,
      task: event.data.task,
      category: event.data.category,
      hours: event.data.duration,
    };
    activities = [...activities, newActivity];
  } else {
    let existingActivity = activities[index]!;
    const start =
      Temporal.PlainDate.compare(date, existingActivity.start) < 0
        ? date
        : existingActivity.start;
    const finish =
      Temporal.PlainDate.compare(date, existingActivity.finish) > 0
        ? date
        : existingActivity.finish;
    existingActivity = {
      ...existingActivity,
      start,
      finish,
      hours: normalizeDuration(existingActivity.hours.add(event.data.duration)),
    };
    activities = activities.toSpliced(index, 1, existingActivity);
  }
  return activities;
}

function projectCategories(categories: string[], event: ActivityLoggedEvent) {
  const category = event.data.category ?? "";
  if (!categories.includes(category)) {
    categories = [...categories, category];
    categories.sort();
  }
  return categories;
}
