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
  TimesheetEntry,
  type TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import { ActivityLoggedEvent } from "./activity_logged_event";
import { Calendar, type Holiday, Vacation } from "./calendar";
import { CapacityChangedEvent } from "./capacity_changed_event";
import { HolidaysChangedEvent } from "./holidays_changed_event";
import { VacationChangedEvent } from "./vacation_changed_event";
import { CategoriesChangedEvent } from "./categories_changed_event";

export type TimesheetReadModel = {
  entries: TimesheetReadModelEntry[];
  holidays: Holiday[];
  vacations: Vacation[];
  capacity: Temporal.Duration;
  categories: string[];
};

export type TimesheetReadModelEntry = {
  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
};

export const initialTimesheetReadModel: TimesheetReadModel = {
  entries: [],
  holidays: [],
  vacations: [],
  capacity: Temporal.Duration.from("PT40H"),
  categories: [],
};

export function projectTimesheet(
  readModel: TimesheetReadModel = initialTimesheetReadModel,
  event:
    | ActivityLoggedEvent
    | CapacityChangedEvent
    | HolidaysChangedEvent
    | VacationChangedEvent
    | CategoriesChangedEvent,
): TimesheetReadModel {
  if (event instanceof ActivityLoggedEvent) {
    const entries = [...readModel.entries, event];
    entries.sort((a, b) => Temporal.Instant.compare(a.timestamp, b.timestamp));
    return { ...readModel, entries };
  } else if (event instanceof HolidaysChangedEvent) {
    return { ...readModel, holidays: event.holidays };
  } else if (event instanceof VacationChangedEvent) {
    return { ...readModel, vacations: event.vacations };
  } else if (event instanceof CapacityChangedEvent) {
    return { ...readModel, capacity: event.capacity };
  } else if (event instanceof CategoriesChangedEvent) {
    return { ...readModel, categories: event.categories };
  } else {
    return readModel;
  }
}

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
  if (!isTimestampInPeriod(entry.timestamp, timeZone, from, to)) {
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

export function queryTimesheet(
  readModel: TimesheetReadModel,
  query: TimesheetQuery,
): TimesheetQueryResult {
  const entries = createEntries(readModel, query);
  const totalHours = sumTotalHours(entries);
  const calendar = Calendar.create(readModel);
  const capacity = determineCapacity(calendar, totalHours, query);
  return TimesheetQueryResult.create({ entries, capacity, totalHours });
}

function createEntries(readModel: TimesheetReadModel, query: TimesheetQuery) {
  const entries: TimesheetEntry[] = [];
  for (const entry of readModel.entries) {
    updateEntries(entries, entry, query);
  }
  entries.sort(TimesheetEntry.compare);
  return entries;
}

function updateEntries(
  entries: TimesheetEntry[],
  entry: TimesheetReadModelEntry,
  { from, to, timeZone }: TimesheetQuery,
) {
  if (!isTimestampInPeriod(entry.timestamp, timeZone, from, to)) {
    return;
  }

  const date = entry.timestamp.toZonedDateTimeISO(timeZone).toPlainDate();
  const index = entries.findIndex(
    (e) =>
      Temporal.PlainDate.compare(e.date, date.toString()) === 0 &&
      e.client === entry.client &&
      e.project === entry.project &&
      e.task === entry.task,
  );
  if (index === -1) {
    const newEntry = TimesheetEntry.create({
      ...entry,
      date,
      hours: entry.duration,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    const accumulatedHours = normalizeDuration(
      existingEntry.hours.add(entry.duration),
    );
    entries[index] = TimesheetEntry.create({
      ...existingEntry,
      hours: accumulatedHours,
    });
  }
}

function sumTotalHours(entries: TimesheetEntry[]) {
  return entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
}

function determineCapacity(
  calendar: Calendar,
  totalHours: Temporal.Duration,
  { from, to, today }: TimesheetQuery,
) {
  const hours = calendar.countWorkingHours(from, to);

  let end: Temporal.PlainDate;
  if (Temporal.PlainDate.compare(today, from) < 0) {
    end = from;
  } else if (Temporal.PlainDate.compare(today, to) > 0) {
    end = to;
  } else {
    end = today;
  }
  const businessDays = calendar.countWorkingHours(from, end);
  const offset = normalizeDuration(totalHours.subtract(businessDays));

  return { hours, offset };
}
