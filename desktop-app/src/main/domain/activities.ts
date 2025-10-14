// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { Clock, normalizeDuration } from "../../shared/common/temporal";
import {
  Activity,
  ActivityLoggedEvent,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  Scope,
  type TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  type WorkingDay,
} from "../../shared/domain/activities";
import { Calendar, type Holiday, Vacation } from "./calendar";

export async function projectRecentActivities(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: RecentActivitiesQuery,
  clock = Clock.systemDefaultZone(),
): Promise<RecentActivitiesQueryResult> {
  const timeZone = query.timeZone ?? clock.zone;
  const today = clock.instant().toZonedDateTimeISO(timeZone).toPlainDate();
  const yesterday = today.subtract({ days: 1 });
  const thisWeekStart = today.subtract({
    days: today.dayOfWeek - 1,
  });
  const thisWeekEnd = thisWeekStart.add("P6D");
  const thisMonthStart = today.with({ day: 1 });
  const nextMonthStart = thisMonthStart.add("P1M");
  const startInclusive = today
    .subtract({ days: 30 })
    .toZonedDateTime({ timeZone })
    .toPlainDate();
  const endExclusive = today.with({ day: today.daysInMonth }).add("P1D");

  let workingDays: WorkingDay[] = [];
  let date: Temporal.PlainDate;
  let activities: Activity[] = [];
  let hoursToday = Temporal.Duration.from("PT0S");
  let hoursYesterday = Temporal.Duration.from("PT0S");
  let hoursThisWeek = Temporal.Duration.from("PT0S");
  let hoursThisMonth = Temporal.Duration.from("PT0S");
  for await (const activity of mapEvents(
    replay,
    timeZone,
    startInclusive,
    endExclusive,
  )) {
    updateWorkingDays(activity);
    updateTimeSummary(activity);
  }
  createWorkingDay();

  workingDays = workingDays.sort((d1, d2) =>
    Temporal.PlainDate.compare(
      Temporal.PlainDate.from(d2.date),
      Temporal.PlainDate.from(d1.date),
    ),
  );
  hoursToday = normalizeDuration(hoursToday);
  hoursYesterday = normalizeDuration(hoursYesterday);
  hoursThisWeek = normalizeDuration(hoursThisWeek);
  hoursThisMonth = normalizeDuration(hoursThisMonth);
  return {
    workingDays,
    timeSummary: {
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    },
  };

  function updateWorkingDays(activity: Activity) {
    const activityDate = Temporal.PlainDate.from(activity.dateTime);
    if (date == null || !activityDate.equals(date)) {
      createWorkingDay();
      date = activityDate;
      activities = [];
    }
    activities.push(activity);
  }

  function createWorkingDay() {
    if (date == null) {
      return;
    }

    activities = activities.sort((a1, a2) =>
      Temporal.PlainDateTime.compare(
        Temporal.PlainDateTime.from(a2.dateTime),
        Temporal.PlainDateTime.from(a1.dateTime),
      ),
    );
    const day = { date, activities };
    workingDays.push(day);
  }

  function updateTimeSummary(activity: Activity) {
    const date = Temporal.PlainDate.from(activity.dateTime);
    const duration = Temporal.Duration.from(activity.duration);
    if (date.equals(today)) {
      hoursToday = hoursToday.add(duration);
    }
    if (date.equals(yesterday)) {
      hoursYesterday = hoursYesterday.add(duration);
    }
    if (
      Temporal.PlainDate.compare(date, thisWeekStart) >= 0 &&
      Temporal.PlainDate.compare(date, thisWeekEnd) <= 0
    ) {
      hoursThisWeek = hoursThisWeek.add(duration);
    }
    if (
      Temporal.PlainDate.compare(date, thisMonthStart) >= 0 &&
      Temporal.PlainDate.compare(date, nextMonthStart) < 0
    ) {
      hoursThisMonth = hoursThisMonth.add(duration);
    }
  }
}

export async function projectReport(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: ReportQuery,
  clock = Clock.systemDefaultZone(),
): Promise<ReportQueryResult> {
  const startInclusive = query.from;
  const endExclusive = query.to ? query.to.add("P1D") : undefined;
  const scope = query.scope;
  const timeZone = query.timeZone ?? clock.zone;

  let entries: ReportEntry[] = [];
  let totalHours = Temporal.Duration.from("PT0S");
  for await (const activity of mapEvents(
    replay,
    timeZone,
    startInclusive,
    endExclusive,
  )) {
    updateEntries(activity);
    updateTotalHours(activity);
  }

  entries = entries.sort((e1, e2) => e1.name.localeCompare(e2.name));
  return {
    entries,
    totalHours,
  };

  function updateEntries(activity: Activity) {
    switch (scope) {
      case Scope.CLIENTS:
        updateEntry(activity.client, activity.duration);
        break;
      case Scope.PROJECTS:
        updateProject(activity.project, activity.client, activity.duration);
        break;
      case Scope.TASKS:
        updateEntry(activity.task, activity.duration);
        break;
      default:
        throw new Error(`Unknown scope: ${scope}`);
    }
  }

  function updateEntry(name: string, hours: Temporal.DurationLike) {
    const index = entries.findIndex((entry) => entry.name === name);
    if (index == -1) {
      entries.push(ReportEntry.create({ name, hours }));
    } else {
      const existingEntry = entries[index];
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(hours),
      );
      entries[index] = {
        ...existingEntry,
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }

  function updateProject(
    name: string,
    client: string,
    hours: Temporal.DurationLike,
  ) {
    const index = entries.findIndex((entry) => entry.name === name);
    if (index == -1) {
      entries.push(ReportEntry.create({ name, hours, client }));
    } else {
      const existingEntry = entries[index];
      let existingClient = existingEntry.client;
      if (!existingClient!.includes(client)) {
        existingClient = existingClient
          ? `${existingClient}, ${client}`
          : client;
      }
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(hours),
      );
      entries[index] = {
        ...existingEntry,
        client: existingClient,
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }

  function updateTotalHours(activity: Activity) {
    const duration = Temporal.Duration.from(activity.duration);
    totalHours = normalizeDuration(totalHours.add(duration));
  }
}

export async function projectTimesheet({
  replay,
  query,
  holidays = [],
  vacations = [],
  capacity = "PT40H",
  clock = Clock.systemDefaultZone(),
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: TimesheetQuery;
  holidays?: Holiday[];
  vacations?: Vacation[];
  capacity?: Temporal.DurationLike | string;
  clock?: Clock;
}): Promise<TimesheetQueryResult> {
  const startInclusive = Temporal.PlainDate.from(query.from);
  const endExclusive = Temporal.PlainDate.from(query.to).add("P1D");
  const timeZone = query.timeZone ?? clock.zone;
  const today = clock.instant().toZonedDateTimeISO(timeZone).toPlainDate();
  const calendar = Calendar.create({ holidays, vacations, capacity });

  let entries: TimesheetEntry[] = [];
  let totalHours = Temporal.Duration.from("PT0S");
  for await (const activity of mapEvents(
    replay,
    timeZone,
    startInclusive,
    endExclusive,
  )) {
    updateEntries(activity);
    updateTotalHours(activity);
  }

  const capacityHours = determineCapacity();
  const offset = determineOffset();
  entries = entries.sort((entry1, entry2) => {
    const dateComparison = Temporal.PlainDate.compare(entry1.date, entry2.date);
    if (dateComparison !== 0) {
      return dateComparison;
    }
    if (entry1.client !== entry2.client) {
      return entry1.client.localeCompare(entry2.client);
    }
    if (entry1.project !== entry2.project) {
      return entry1.project.localeCompare(entry2.project);
    }
    return entry1.task.localeCompare(entry2.task);
  });
  totalHours = normalizeDuration(totalHours);
  return {
    entries,
    totalHours,
    capacity: {
      hours: capacityHours,
      offset,
    },
  };

  function updateEntries(activity: Activity) {
    const date = Temporal.PlainDate.from(activity.dateTime);
    const index = entries.findIndex(
      (entry) =>
        Temporal.PlainDate.compare(entry.date, date.toString()) === 0 &&
        entry.client === activity.client &&
        entry.project === activity.project &&
        entry.task === activity.task,
    );
    if (index === -1) {
      const newEntry: TimesheetEntry = {
        date,
        client: activity.client,
        project: activity.project,
        task: activity.task,
        hours: activity.duration,
      };
      entries.push(newEntry);
    } else {
      const existingEntry = entries[index];
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(activity.duration),
      );
      entries[index] = {
        ...existingEntry,
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }

  function updateTotalHours(activity: Activity) {
    const duration = Temporal.Duration.from(activity.duration);
    totalHours = totalHours.add(duration);
  }

  function determineCapacity(): Temporal.Duration {
    return calendar.countWorkingHours(startInclusive, endExclusive);
  }

  function determineOffset(): Temporal.Duration {
    let end: Temporal.PlainDate;
    if (Temporal.PlainDate.compare(today, startInclusive) < 0) {
      end = startInclusive;
    } else if (Temporal.PlainDate.compare(today, endExclusive) >= 0) {
      end = endExclusive;
    } else {
      end = today.add("P1D");
    }
    const businessDays = calendar.countWorkingHours(startInclusive, end);
    const offset = totalHours.subtract(businessDays);
    return normalizeDuration(offset);
  }
}

async function* mapEvents(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  timeZone: Temporal.TimeZoneLike,
  startInclusive?: Temporal.PlainDate | Temporal.PlainDateLike | string,
  endExclusive?: Temporal.PlainDate | Temporal.PlainDateLike | string,
): AsyncGenerator<Activity> {
  for await (const event of replay) {
    const date = event.timestamp.toZonedDateTimeISO(timeZone).toPlainDate();
    if (
      startInclusive &&
      Temporal.PlainDate.compare(date, startInclusive) < 0
    ) {
      continue;
    }
    if (endExclusive && Temporal.PlainDate.compare(date, endExclusive) >= 0) {
      continue;
    }

    const dateTime = event.timestamp
      .toZonedDateTimeISO(timeZone)
      .toPlainDateTime();
    const activity = Activity.create({
      dateTime,
      duration: event.duration,
      client: event.client,
      project: event.project,
      task: event.task,
      notes: event.notes,
    });
    yield activity;
  }
}
