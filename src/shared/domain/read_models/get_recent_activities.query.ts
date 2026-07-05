// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetView } from "./timesheet.read_model";
import { normalizeDuration } from "../value_objects/activity.value_object";
import {
  compareRecentActivity,
  createRecentActivity,
} from "../value_objects/recent_activity.value_object";
import {
  createTimeSummary,
  type TimeSummary,
} from "../value_objects/time_summary.value_object";
import type { TimesheetViewEntry } from "../value_objects/timesheet_view_entry.value_object";
import {
  compareWorkingDay,
  createWorkingDay,
  type WorkingDay,
} from "../value_objects/working_day.value_object";

export interface GetRecentActivitiesQuery {
  readonly type: "get-recent-activities";
  readonly data: GetRecentActivitiesQueryData;
}

export type GetRecentActivitiesQueryData = Readonly<{
  today: Temporal.PlainDateLike;
  timeZone: Temporal.TimeZoneLike;
}>;

export function createGetRecentActivitiesQuery({
  today = Temporal.Now.plainDateISO().toString(),
  timeZone = Temporal.Now.timeZoneId(),
}: {
  today?: Temporal.PlainDateLike;
  timeZone?: Temporal.TimeZoneLike;
} = {}): GetRecentActivitiesQuery {
  return {
    type: "get-recent-activities",
    data: { today, timeZone },
  };
}

export interface GetRecentActivitiesQueryResult {
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
}

export function createGetRecentActivitiesQueryResult({
  workingDays = [],
  timeSummary = createTimeSummary(),
}: {
  workingDays?: WorkingDay[];
  timeSummary?: TimeSummary;
} = {}): GetRecentActivitiesQueryResult {
  return { workingDays, timeSummary };
}

export function getRecentActivities(
  view: TimesheetView,
  query: GetRecentActivitiesQuery,
): GetRecentActivitiesQueryResult {
  // we assume the view is pre-filtered by last 30 days and end of current month
  const workingDays = createWorkingDays(view);
  const timeSummary = calculateTimeSummary(view, query);
  return createGetRecentActivitiesQueryResult({
    workingDays,
    timeSummary,
  });
}

function createWorkingDays(view: TimesheetView) {
  const workingDays: WorkingDay[] = [];
  for (const entry of view.entries) {
    updateWorkingDays(workingDays, entry);
  }
  return workingDays.sort(compareWorkingDay).reverse();
}

function updateWorkingDays(
  workingDays: WorkingDay[],
  entry: TimesheetViewEntry,
) {
  let workingDay = workingDays.at(-1);
  if (
    workingDay?.date == null ||
    !Temporal.PlainDate.from(entry.timestamp).equals(workingDay.date)
  ) {
    workingDay = createWorkingDay({
      date: Temporal.PlainDate.from(entry.timestamp),
    });
    workingDays.push(workingDay);
  }
  workingDay.activities.push(
    createRecentActivity({
      time: Temporal.PlainDateTime.from(entry.timestamp)
        .toPlainTime()
        .toString(),
      client: entry.client,
      project: entry.project,
      task: entry.task,
      notes: entry.notes,
      category: entry.category,
    }),
  );
  workingDay.activities.sort(compareRecentActivity).reverse();
}

function calculateTimeSummary(
  view: TimesheetView,
  query: GetRecentActivitiesQuery,
) {
  const today = Temporal.PlainDate.from(query.data.today);
  const yesterday = today.subtract("P1D");
  const weekStart = today.subtract({
    days: today.dayOfWeek - 1,
  });
  const weekEnd = weekStart.add("P6D");
  const monthStart = today.with({ day: 1 });
  const monthEnd = monthStart.add("P1M").subtract("P1D");
  let hoursToday = Temporal.Duration.from("PT0S");
  let hoursYesterday = Temporal.Duration.from("PT0S");
  let hoursThisWeek = Temporal.Duration.from("PT0S");
  let hoursThisMonth = Temporal.Duration.from("PT0S");
  for (const entry of view.entries) {
    const date = Temporal.PlainDate.from(entry.timestamp);
    const hours = entry.duration;
    if (date.equals(query.data.today)) {
      hoursToday = hoursToday.add(hours);
    }
    if (date.equals(yesterday)) {
      hoursYesterday = hoursYesterday.add(hours);
    }
    if (
      Temporal.PlainDate.compare(date, weekStart) >= 0 &&
      Temporal.PlainDate.compare(date, weekEnd) <= 0
    ) {
      hoursThisWeek = hoursThisWeek.add(hours);
    }
    if (
      Temporal.PlainDate.compare(date, monthStart) >= 0 &&
      Temporal.PlainDate.compare(date, monthEnd) <= 0
    ) {
      hoursThisMonth = hoursThisMonth.add(hours);
    }
  }
  return createTimeSummary({
    today: normalizeDuration(hoursToday),
    yesterday: normalizeDuration(hoursYesterday),
    thisWeek: normalizeDuration(hoursThisWeek),
    thisMonth: normalizeDuration(hoursThisMonth),
  });
}
