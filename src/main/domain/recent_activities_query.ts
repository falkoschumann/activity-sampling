// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { LoggedActivity } from "../../shared/domain/logged_activity";
import {
  type RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../../shared/domain/recent_activities_query";
import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";
import {
  initialTimesheetReadModel,
  type TimesheetReadModelEntry,
} from "./timesheet_read_model";

export function queryRecentActivities(
  readModel = initialTimesheetReadModel,
  query: RecentActivitiesQuery,
): RecentActivitiesQueryResult {
  const workingDays = createWorkingDays(readModel.entries, query);
  const timeSummary = createTimeSummary(workingDays, query.today);
  return RecentActivitiesQueryResult.create({
    workingDays,
    timeSummary,
    categories: readModel.categories,
  });
}

function createWorkingDays(
  entries: TimesheetReadModelEntry[],
  query: RecentActivitiesQuery,
) {
  const from = query.today.subtract({ days: 30 });
  const to = query.today.with({ day: query.today.daysInMonth });
  const workingDays: WorkingDay[] = [];
  for (const entry of entries) {
    updateWorkingDays(workingDays, entry, { ...query, from, to });
  }
  return workingDays.reverse();
}

function updateWorkingDays(
  workingDays: WorkingDay[],
  entry: TimesheetReadModelEntry,
  {
    from,
    to,
    timeZone,
  }: RecentActivitiesQuery & {
    from: Temporal.PlainDate;
    to: Temporal.PlainDate;
  },
) {
  if (
    !isTimestampInPeriod({ timestamp: entry.timestamp, timeZone, from, to })
  ) {
    return;
  }

  let workingDay = workingDays.at(-1);
  const dateTime = entry.timestamp
    .toZonedDateTimeISO(timeZone)
    .toPlainDateTime();
  if (workingDay?.date == null) {
    workingDay = WorkingDay.create({
      date: dateTime.toPlainDate(),
      activities: [],
    });
    workingDays.push(workingDay);
  } else if (!dateTime.toPlainDate().equals(workingDay.date)) {
    workingDay = WorkingDay.create({
      date: dateTime.toPlainDate(),
      activities: [],
    });
    workingDays.push(workingDay);
  }
  workingDay.activities.push(
    LoggedActivity.create({
      dateTime,
      duration: entry.duration,
      client: entry.client,
      project: entry.project,
      task: entry.task,
      notes: entry.notes,
      category: entry.category,
    }),
  );
  workingDay.activities.sort(LoggedActivity.compare);
}

function createTimeSummary(
  workingDays: WorkingDay[],
  today: Temporal.PlainDate,
) {
  const yesterday = today.subtract("P1D");
  const weekStart = today.subtract({ days: today.dayOfWeek - 1 });
  const weekEnd = weekStart.add("P6D");
  const monthStart = today.with({ day: 1 });
  const monthEnd = monthStart.add("P1M").subtract("P1D");
  let hoursToday = Temporal.Duration.from("PT0S");
  let hoursYesterday = Temporal.Duration.from("PT0S");
  let hoursThisWeek = Temporal.Duration.from("PT0S");
  let hoursThisMonth = Temporal.Duration.from("PT0S");
  for (const workingDay of workingDays) {
    const date = workingDay.date;
    for (const activity of workingDay.activities) {
      const hours = activity.duration;
      if (date.equals(today)) {
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
  }
  return TimeSummary.create({
    hoursToday: normalizeDuration(hoursToday),
    hoursYesterday: normalizeDuration(hoursYesterday),
    hoursThisWeek: normalizeDuration(hoursThisWeek),
    hoursThisMonth: normalizeDuration(hoursThisMonth),
  });
}
