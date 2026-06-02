// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { normalizeDuration } from "../../shared/domain/temporal";
import { ActivityLoggedEvent } from "./activity_logged_event";

export type ReportReadModel = {
  activities: Activity[];
  categories: string[];
};

export type Activity = {
  readonly start: Temporal.Instant;
  readonly finish: Temporal.Instant;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;
};

export const initialReportReadModel: ReportReadModel = {
  activities: [],
  categories: [],
};

export function projectReport(
  readModel = initialReportReadModel,
  event: ActivityLoggedEvent,
): ReportReadModel {
  const activities = projectActivities(readModel.activities, event);
  const categories = projectCategories(readModel.categories, event);
  return { activities, categories };
}

function projectActivities(activities: Activity[], event: ActivityLoggedEvent) {
  const index = activities.findIndex(
    (activity) =>
      activity.client === event.client &&
      activity.project === event.project &&
      activity.task === event.task &&
      activity.category == event.category,
  );
  if (index == -1) {
    const newActivity = {
      start: event.timestamp,
      finish: event.timestamp,
      client: event.client,
      project: event.project,
      task: event.task,
      category: event.category,
      hours: event.duration,
    };
    activities = [...activities, newActivity];
  } else {
    let existingActivity = activities[index]!;
    const start =
      Temporal.Instant.compare(event.timestamp, existingActivity.start) < 0
        ? event.timestamp
        : existingActivity.start;
    const finish =
      Temporal.Instant.compare(event.timestamp, existingActivity.finish) > 0
        ? event.timestamp
        : existingActivity.finish;
    existingActivity = {
      ...existingActivity,
      start,
      finish,
      hours: normalizeDuration(existingActivity.hours.add(event.duration)),
    };
    activities = activities.toSpliced(index, 1, existingActivity);
  }
  return activities;
}

function projectCategories(categories: string[], event: ActivityLoggedEvent) {
  const category = event.category ?? "";
  if (!categories.includes(category)) {
    categories = [...categories, category];
    categories.sort();
  }
  return categories;
}
