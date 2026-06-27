// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { initialReportReadModel, type RawActivity } from "./report_read_model";
import { EstimateQuery } from "../../shared/domain/estimate_query";
import { normalizeDuration } from "../../shared/domain/temporal";

export type Activity = {
  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;
  readonly cycleTime: number;
};

export function createActivities(
  readModel: typeof initialReportReadModel,
  query: EstimateQuery,
) {
  const activities: Activity[] = [];
  for (const activity of readModel.activities) {
    updateActivities(activities, activity, query);
  }
  activities.sort(compareActivity);
  return activities;
}

function updateActivities(
  activities: Activity[],
  activity: RawActivity,
  query: EstimateQuery,
) {
  if (!filterCategory(query.categories)(activity)) {
    return;
  }

  let start = activity.start.toZonedDateTimeISO(query.timeZone).toPlainDate();
  let finish = activity.finish.toZonedDateTimeISO(query.timeZone).toPlainDate();
  const index = activities.findIndex(
    (a) =>
      a.task === activity.task &&
      a.project === activity.project &&
      a.client === activity.client,
  );
  if (index == -1) {
    activities.push({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      hours: activity.hours,
      cycleTime: finish.since(start).total("days") + 1,
    });
  } else {
    const existingActivity = activities[index]!;
    start =
      Temporal.PlainDate.compare(start, existingActivity.start) < 0
        ? start
        : existingActivity.start;
    finish =
      Temporal.PlainDate.compare(finish, existingActivity.finish) > 0
        ? finish
        : existingActivity.finish;
    activities[index] = {
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      hours: normalizeDuration(activity.hours.add(existingActivity.hours)),
      cycleTime: finish.since(start).total("days") + 1,
    };
  }
}

function filterCategory(categories: string[]) {
  return (activity: RawActivity) =>
    categories.length === 0 || categories.includes(activity.category ?? "");
}

function compareActivity(a: Activity, b: Activity) {
  const taskComparison = a.task.localeCompare(b.task);
  if (taskComparison !== 0) {
    return taskComparison;
  }

  const projectComparison = a.project.localeCompare(b.project);
  if (projectComparison !== 0) {
    return projectComparison;
  }

  return a.client.localeCompare(b.client);
}
