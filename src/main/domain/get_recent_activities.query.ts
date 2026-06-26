// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type TimesheetView,
  type TimesheetViewEntry,
} from "./timesheet.read_model";
import {
  type GetRecentActivitiesQuery,
  GetRecentActivitiesQueryResult,
} from "../../shared/domain/get_recent_activities.query";
import { RecentActivity } from "../../shared/domain/recent_activity";
import { normalizeDuration } from "../../shared/domain/temporal";
import { TimeSummary } from "../../shared/domain/time_summary";
import { WorkingDay } from "../../shared/domain/working_day";

export function getRecentActivities(
  view: TimesheetView,
  query: GetRecentActivitiesQuery,
): GetRecentActivitiesQueryResult {
  // we assume the view is pre-filtered by last 30 days and end of current month
  const workingDays = createWorkingDays(view, query);
  const timeSummary = createTimeSummary(view, query);
  return GetRecentActivitiesQueryResult.create({
    workingDays,
    timeSummary,
  });
}

function createWorkingDays(
  view: TimesheetView,
  query: GetRecentActivitiesQuery,
) {
  const workingDays: WorkingDay[] = [];
  for (const entry of view.entries) {
    updateWorkingDays(workingDays, entry, query);
  }
  return workingDays.sort(WorkingDay.compare).reverse();
}

function updateWorkingDays(
  workingDays: WorkingDay[],
  entry: TimesheetViewEntry,
  query: GetRecentActivitiesQuery,
) {
  let workingDay = workingDays.at(-1);
  const dateTime = entry.timestamp
    .toZonedDateTimeISO(query.data.timeZone)
    .toPlainDateTime();
  if (
    workingDay?.date == null ||
    !dateTime.toPlainDate().equals(workingDay.date)
  ) {
    workingDay = WorkingDay.create({ date: dateTime });
    workingDays.push(workingDay);
  }
  workingDay.activities.push(
    RecentActivity.create({
      time: dateTime,
      client: entry.client,
      project: entry.project,
      task: entry.task,
      notes: entry.notes,
      category: entry.category,
    }),
  );
  workingDay.activities.sort(RecentActivity.compare).reverse();
}

function createTimeSummary(
  view: TimesheetView,
  query: GetRecentActivitiesQuery,
) {
  const yesterday = query.data.today.subtract("P1D");
  const weekStart = query.data.today.subtract({
    days: query.data.today.dayOfWeek - 1,
  });
  const weekEnd = weekStart.add("P6D");
  const monthStart = query.data.today.with({ day: 1 });
  const monthEnd = monthStart.add("P1M").subtract("P1D");
  let hoursToday = Temporal.Duration.from("PT0S");
  let hoursYesterday = Temporal.Duration.from("PT0S");
  let hoursThisWeek = Temporal.Duration.from("PT0S");
  let hoursThisMonth = Temporal.Duration.from("PT0S");
  for (const entry of view.entries) {
    const date = entry.timestamp
      .toZonedDateTimeISO(query.data.timeZone)
      .toPlainDateTime()
      .toPlainDate();
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
  return TimeSummary.create({
    today: normalizeDuration(hoursToday),
    yesterday: normalizeDuration(hoursYesterday),
    thisWeek: normalizeDuration(hoursThisWeek),
    thisMonth: normalizeDuration(hoursThisMonth),
  });
}
