// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetView, TimesheetViewEntry } from "./timesheet.read_model";
import { RecentActivity } from "./recent_activity";
import { normalizeDuration } from "./temporal";
import { TimeSummary } from "./time_summary";
import { WorkingDay } from "./working_day";

export class GetRecentActivitiesQuery {
  static create({
    today = Temporal.Now.plainDateISO(),
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    today?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return new GetRecentActivitiesQuery(today, timeZone);
  }

  static createTestInstance({
    today = "2026-03-29T11:56",
    timeZone = "Europe/Berlin",
  }: {
    today?: Temporal.PlainDateLike;
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetRecentActivitiesQuery.create({ today, timeZone });
  }

  readonly type = "get-recent-activities";
  readonly data;

  private constructor(
    today: Temporal.PlainDateLike,
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.data = {
      today: Temporal.PlainDate.from(today),
      timeZone,
    };
  }
}

export class GetRecentActivitiesQueryResult {
  static create({
    workingDays = [],
    timeSummary = TimeSummary.create(),
  }: {
    workingDays?: WorkingDay[];
    timeSummary?: TimeSummary;
  } = {}) {
    return new GetRecentActivitiesQueryResult(workingDays, timeSummary);
  }

  static createTestInstance({
    workingDays = [WorkingDay.createTestInstance()],
    timeSummary = TimeSummary.createTestInstance(),
  }: {
    workingDays?: WorkingDay[];
    timeSummary?: TimeSummary;
  } = {}) {
    return GetRecentActivitiesQueryResult.create({ workingDays, timeSummary });
  }

  readonly workingDays;
  readonly timeSummary;

  private constructor(workingDays: WorkingDay[], timeSummary: TimeSummary) {
    this.workingDays = workingDays.map(WorkingDay.create);
    this.timeSummary = TimeSummary.create(timeSummary);
  }
}

export function getRecentActivities(
  view: TimesheetView,
  query: GetRecentActivitiesQuery,
): GetRecentActivitiesQueryResult {
  // we assume the view is pre-filtered by last 30 days and end of current month
  const workingDays = createWorkingDays(view);
  const timeSummary = createTimeSummary(view, query);
  return GetRecentActivitiesQueryResult.create({
    workingDays,
    timeSummary,
  });
}

function createWorkingDays(view: TimesheetView) {
  const workingDays: WorkingDay[] = [];
  for (const entry of view.entries) {
    updateWorkingDays(workingDays, entry);
  }
  return workingDays.sort(WorkingDay.compare).reverse();
}

function updateWorkingDays(
  workingDays: WorkingDay[],
  entry: TimesheetViewEntry,
) {
  let workingDay = workingDays.at(-1);
  if (
    workingDay?.date == null ||
    !entry.timestamp.toPlainDate().equals(workingDay.date)
  ) {
    workingDay = WorkingDay.create({ date: entry.timestamp });
    workingDays.push(workingDay);
  }
  workingDay.activities.push(
    RecentActivity.create({
      time: entry.timestamp,
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
    const date = entry.timestamp.toPlainDate();
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
