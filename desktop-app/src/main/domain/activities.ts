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
  Statistics,
  StatisticsQuery,
  StatisticsQueryResult,
  type TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  type WorkingDay,
} from "../../shared/domain/activities";
import { Calendar, type Holiday, Vacation } from "./calendar";

export async function projectRecentActivities({
  replay,
  query,
  clock = Clock.systemDefaultZone(),
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: RecentActivitiesQuery;
  clock?: Clock;
}): Promise<RecentActivitiesQueryResult> {
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

export async function projectReport({
  replay,
  query,
  clock = Clock.systemDefaultZone(),
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: ReportQuery;
  clock?: Clock;
}): Promise<ReportQueryResult> {
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

export async function projectStatistics({
  replay,
  query,
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: StatisticsQuery;
  clock?: Clock;
}): Promise<StatisticsQueryResult> {
  let xAxisLabel: string;
  let days: number[];
  if (query.statistics === Statistics.WORKING_HOURS) {
    xAxisLabel = "Duration (days)";

    const tasks: Record<string, Temporal.Duration> = {};
    for await (const event of replay) {
      const duration = Temporal.Duration.from(event.duration);
      if (tasks[event.task]) {
        tasks[event.task] = normalizeDuration(tasks[event.task].add(duration));
      } else {
        tasks[event.task] = normalizeDuration(duration);
      }
    }

    days = Object.values(tasks)
      .map((duration) => duration.total("hours"))
      .map((hours) => hours / 8)
      .filter((days) => (query.ignoreSmallTasks ? days > 0.5 : true))
      .sort((a, b) => a - b);
  } else if (query.statistics === Statistics.LEAD_TIMES) {
    xAxisLabel = "Lead time (days)";

    const leadTimes: Record<
      string,
      { from: Temporal.Instant; to: Temporal.Instant }
    > = {};
    for await (const event of replay) {
      if (leadTimes[event.task]) {
        if (
          Temporal.Instant.compare(
            event.timestamp,
            leadTimes[event.task].from,
          ) < 0
        ) {
          leadTimes[event.task].from = event.timestamp;
        }
        if (
          Temporal.Instant.compare(event.timestamp, leadTimes[event.task].to) >
          0
        ) {
          leadTimes[event.task].to = event.timestamp;
        }
      } else {
        leadTimes[event.task] = {
          from: event.timestamp,
          to: event.timestamp,
        };
      }
    }

    const tasks: Record<string, Temporal.Duration> = {};
    for (const [task, leadTime] of Object.entries(leadTimes)) {
      tasks[task] = normalizeDuration(leadTime.to.since(leadTime.from));
    }

    days = Object.values(tasks)
      .map((duration) => duration.total("days"))
      .filter((days) => (query.ignoreSmallTasks ? days > 0.5 : true))
      .sort((a, b) => a - b);
  } else {
    throw new Error(`Unknown statistics for ${query.statistics}.`);
  }

  const maxDay = days.at(-1) ?? 0;

  const binEdges: number[] = [];
  const frequencies: number[] = [];
  let i = 0;
  while (i < Math.ceil(maxDay)) {
    if (i === 0) {
      binEdges.push(0);
      frequencies.push(0);
      binEdges.push(0.5);
      frequencies.push(0);
      binEdges.push(1);
      frequencies.push(0);
      binEdges.push(2);
      i = 2;
    } else {
      i = binEdges.at(-2)! + binEdges.at(-1)!;
      frequencies.push(0);
      binEdges.push(i);
    }
  }

  for (const day of days) {
    for (let i = 0; i < binEdges.length - 1; i++) {
      if (binEdges[i] < day && day <= binEdges[i + 1]) {
        frequencies[i]++;
        break;
      }
    }
  }

  const edge0 = 0;
  let edge25 = 0;
  let edge50 = 0;
  let edge75 = 0;
  let edge100 = 0;
  if (days.length > 0) {
    const i25 = Math.max(0, days.length * 0.25 - 1);
    if (Number.isInteger(i25)) {
      edge25 = days[i25];
    } else {
      edge25 = (days[Math.floor(i25)] + days[Math.ceil(i25)]) / 2;
    }
    edge25 = Math.round(edge25 * 10) / 10;

    if (days.length % 2 === 0) {
      edge50 = (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
    } else {
      edge50 = days[Math.floor(days.length / 2)];
    }
    edge50 = Math.round(edge50 * 10) / 10;

    const i75 = days.length * 0.75 - 1;
    if (Number.isInteger(i75)) {
      edge75 = days[i75];
    } else {
      edge75 = (days[Math.floor(i75)] + days[Math.ceil(i75)]) / 2;
    }
    edge75 = Math.round(edge75 * 10) / 10;

    edge100 = maxDay;
  }

  return {
    histogram: {
      binEdges: binEdges.map((edge) => String(edge)),
      frequencies,
      xAxisLabel,
      yAxisLabel: "Number of Tasks",
    },
    median: { edge0, edge25, edge50, edge75, edge100 },
  };
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
