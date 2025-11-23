// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { normalizeDuration } from "../../shared/common/temporal";
import {
  ActivityLoggedEvent,
  EstimateQueryResult,
  RecentActivitiesQueryResult,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  ReportScope,
  StatisticsQuery,
  StatisticsQueryResult,
  StatisticsScope,
  type TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  type WorkingDay,
} from "../../shared/domain/activities";
import { Calendar, type Holiday, Vacation } from "./calendar";

export class Activity {
  static create({
    start,
    finish,
    client,
    project,
    task,
    notes,
    category,
    hours,
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
    hours: Temporal.DurationLike | string;
  }): Activity {
    return new Activity(
      start,
      finish,
      client,
      project,
      task,
      hours,
      notes,
      category,
    );
  }

  static createTestInstance({
    start = "2025-08-14",
    finish = "2025-08-14",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
    hours = "PT30M",
  }: {
    start?: Temporal.PlainDateLike | string;
    finish?: Temporal.PlainDateLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
    hours?: Temporal.DurationLike | string;
  } = {}): Activity {
    return Activity.create({
      start,
      finish,
      client,
      project,
      task,
      notes,
      category,
      hours,
    });
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;

  private constructor(
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike | string,
    notes?: string,
    category?: string,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
    this.hours = Temporal.Duration.from(hours);
  }
}

export async function projectActivities(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  startInclusive?: Temporal.PlainDateLike | string,
  endExclusive?: Temporal.PlainDateLike | string,
): Promise<Activity[]> {
  const activities: Activity[] = [];
  for await (const event of replay) {
    const date = event.dateTime.toPlainDate();
    if (
      startInclusive &&
      Temporal.PlainDate.compare(date, startInclusive) < 0
    ) {
      continue;
    }
    if (endExclusive && Temporal.PlainDate.compare(date, endExclusive) >= 0) {
      continue;
    }

    const index = activities.findIndex(
      (activity) =>
        activity.client === event.client &&
        activity.project === event.project &&
        activity.task === event.task &&
        activity.category === event.category,
    );
    if (index === -1) {
      const activity = Activity.create({
        start: date,
        finish: date,
        client: event.client,
        project: event.project,
        task: event.task,
        notes: event.notes,
        category: event.category,
        hours: event.duration,
      });
      activities.push(activity);
    } else {
      const activity = activities[index];
      let start = activity.start;
      let finish = activity.finish;
      if (Temporal.PlainDate.compare(date, start) < 0) {
        start = date;
      }
      if (Temporal.PlainDate.compare(date, finish) > 0) {
        finish = date;
      }
      const accumulatedHours = activity.hours.add(event.duration);
      activities[index] = {
        ...activity,
        start,
        finish,
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }
  return activities;
}

export async function projectRecentActivities({
  replay,
  today,
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  today: Temporal.PlainDate;
}): Promise<RecentActivitiesQueryResult> {
  const yesterday = today.subtract({ days: 1 });
  const thisWeekStart = today.subtract({
    days: today.dayOfWeek - 1,
  });
  const thisWeekEnd = thisWeekStart.add("P6D");
  const thisMonthStart = today.with({ day: 1 });
  const nextMonthStart = thisMonthStart.add("P1M");
  const startInclusive = today.subtract({ days: 30 });
  const endExclusive = today.with({ day: today.daysInMonth }).add("P1D");

  let workingDays: WorkingDay[] = [];
  let date: Temporal.PlainDate;
  let activities: ActivityLoggedEvent[] = [];
  let hoursToday = Temporal.Duration.from("PT0S");
  let hoursYesterday = Temporal.Duration.from("PT0S");
  let hoursThisWeek = Temporal.Duration.from("PT0S");
  let hoursThisMonth = Temporal.Duration.from("PT0S");
  for await (const event of filterEvents(
    replay,
    startInclusive,
    endExclusive,
  )) {
    updateWorkingDays(event);
    updateTimeSummary(event);
  }
  createWorkingDay();

  workingDays = workingDays.sort((d1, d2) =>
    Temporal.PlainDate.compare(d2.date, d1.date),
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

  function updateWorkingDays(event: ActivityLoggedEvent) {
    const activityDate = event.dateTime.toPlainDate();
    if (date == null || !activityDate.equals(date)) {
      createWorkingDay();
      date = activityDate;
      activities = [];
    }
    activities.push(
      ActivityLoggedEvent.create({
        dateTime: event.dateTime,
        duration: event.duration,
        client: event.client,
        project: event.project,
        task: event.task,
        notes: event.notes,
        category: event.category,
      }),
    );
  }

  function createWorkingDay() {
    if (date == null) {
      return;
    }

    activities = activities.sort((a1, a2) =>
      Temporal.PlainDateTime.compare(a2.dateTime, a1.dateTime),
    );
    const day = { date, activities };
    workingDays.push(day);
  }

  function updateTimeSummary(event: ActivityLoggedEvent) {
    const date = event.dateTime.toPlainDate();
    const hours = event.duration;
    if (date.equals(today)) {
      hoursToday = hoursToday.add(hours);
    }
    if (date.equals(yesterday)) {
      hoursYesterday = hoursYesterday.add(hours);
    }
    if (
      Temporal.PlainDate.compare(date, thisWeekStart) >= 0 &&
      Temporal.PlainDate.compare(date, thisWeekEnd) <= 0
    ) {
      hoursThisWeek = hoursThisWeek.add(hours);
    }
    if (
      Temporal.PlainDate.compare(date, thisMonthStart) >= 0 &&
      Temporal.PlainDate.compare(date, nextMonthStart) < 0
    ) {
      hoursThisMonth = hoursThisMonth.add(hours);
    }
  }
}

export async function projectReport({
  replay,
  query,
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: ReportQuery;
}): Promise<ReportQueryResult> {
  const startInclusive = query.from;
  const endExclusive = query.to ? query.to.add("P1D") : undefined;
  const scope = query.scope;
  const activities = await projectActivities(
    replay,
    startInclusive,
    endExclusive,
  );
  const entries = createEntries();
  const totalHours = calculateTotalHours();
  return {
    entries,
    totalHours,
  };

  function createEntries() {
    switch (scope) {
      case ReportScope.CLIENTS:
        return createClientEntries();
      case ReportScope.PROJECTS:
        return createProjectEntries();
      case ReportScope.TASKS:
        return createTaskEntries();
      case ReportScope.CATEGORIES:
        return createCategoriesEntries();
    }

    throw new Error(`Unknown scope: ${scope}`);
  }

  function createClientEntries() {
    const entries: ReportEntry[] = [];
    for (const activity of activities) {
      const index = entries.findIndex(
        (entry) => entry.client === activity.client,
      );
      if (index == -1) {
        const cycleTime =
          activity.finish.since(activity.start).total("days") + 1;
        entries.push(
          ReportEntry.create({
            start: activity.start,
            finish: activity.finish,
            client: activity.client,
            hours: activity.hours,
            cycleTime,
          }),
        );
      } else {
        entries[index] = updateEntry(entries[index], activity);
      }
    }
    return entries.sort((a, b) => a.client.localeCompare(b.client));
  }

  function createProjectEntries() {
    const entries: ReportEntry[] = [];
    for (const activity of activities) {
      const index = entries.findIndex(
        (entry) => entry.project === activity.project,
      );
      if (index == -1) {
        const cycleTime =
          activity.finish.since(activity.start).total("days") + 1;
        entries.push(
          ReportEntry.create({
            start: activity.start,
            finish: activity.finish,
            client: activity.client,
            project: activity.project,
            hours: activity.hours,
            cycleTime,
          }),
        );
      } else {
        entries[index] = updateEntry(entries[index], activity, "client");
      }
    }
    return entries.sort((a, b) => {
      const projectComparison = a.project.localeCompare(b.project);
      if (projectComparison !== 0) {
        return projectComparison;
      }

      return a.client.localeCompare(b.client);
    });
  }

  function createTaskEntries() {
    const entries: ReportEntry[] = [];
    for (const activity of activities) {
      const index = entries.findIndex(
        (entry) =>
          entry.task === activity.task &&
          entry.project === activity.project &&
          entry.client === activity.client,
      );
      if (index == -1) {
        const cycleTime =
          activity.finish.since(activity.start).total("days") + 1;
        entries.push(
          ReportEntry.create({
            start: activity.start,
            finish: activity.finish,
            client: activity.client,
            project: activity.project,
            task: activity.task,
            category: activity.category,
            hours: activity.hours,
            cycleTime,
          }),
        );
      } else {
        entries[index] = updateEntry(entries[index], activity, "category");
      }
    }
    return entries.sort((a, b) => {
      const taskComparison = a.task.localeCompare(b.task);
      if (taskComparison !== 0) {
        return taskComparison;
      }

      const projectComparison = a.project.localeCompare(b.project);
      if (projectComparison !== 0) {
        return projectComparison;
      }

      const clientComparison = a.client.localeCompare(b.client);
      if (clientComparison !== 0) {
        return clientComparison;
      }

      return a.category.localeCompare(b.category);
    });
  }

  function createCategoriesEntries() {
    const entries: ReportEntry[] = [];
    for (const activity of activities) {
      const index = entries.findIndex(
        (entry) => entry.category === (activity.category ?? ""),
      );
      if (index == -1) {
        const cycleTime =
          activity.finish.since(activity.start).total("days") + 1;
        entries.push(
          ReportEntry.create({
            start: activity.start,
            finish: activity.finish,
            category: activity.category,
            hours: activity.hours,
            cycleTime,
          }),
        );
      } else {
        entries[index] = updateEntry(entries[index], activity);
      }
    }
    return entries.sort((a, b) => a.category.localeCompare(b.category));
  }

  function updateEntry(
    entry: ReportEntry,
    activity: Activity,
    groupBy?: "client" | "category",
  ): ReportEntry {
    let start = entry.start;
    let finish = entry.finish;
    if (Temporal.PlainDate.compare(activity.start, start) < 0) {
      start = activity.start;
    }
    if (Temporal.PlainDate.compare(activity.finish, finish) > 0) {
      finish = activity.finish;
    }
    const cycleTime = finish.since(start).total("days") + 1;
    const accumulatedHours = entry.hours.add(activity.hours);
    const newEntry = {
      ...entry,
      start,
      finish,
      hours: normalizeDuration(accumulatedHours),
      cycleTime,
    };
    if (
      groupBy != null &&
      activity[groupBy] != null &&
      !entry[groupBy].includes(activity[groupBy])
    ) {
      let groups = entry[groupBy].split(", ");
      groups.push(activity[groupBy]);
      groups = groups.sort();
      newEntry[groupBy] = groups.join(", ");
    }
    return newEntry;
  }

  function calculateTotalHours() {
    let hours = Temporal.Duration.from("PT0S");
    for (const activity of activities) {
      hours = hours.add(activity.hours);
    }
    return normalizeDuration(hours);
  }
}

export async function projectStatistics({
  replay,
  query,
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: StatisticsQuery;
}): Promise<StatisticsQueryResult> {
  let xAxisLabel: string;
  let days: number[] = [];
  const activities = await projectActivities(replay);
  if (query.scope === StatisticsScope.WORKING_HOURS) {
    xAxisLabel = "Duration (days)";

    const tasks: Record<string, Temporal.Duration> = {};
    for await (const activity of activities) {
      if (query.category != null && activity.category !== query.category) {
        continue;
      }

      const hours = activity.hours;
      if (tasks[activity.task]) {
        tasks[activity.task] = normalizeDuration(
          tasks[activity.task].add(hours),
        );
      } else {
        tasks[activity.task] = normalizeDuration(hours);
      }
    }

    days = Object.values(tasks)
      .map((duration) => duration.total("hours"))
      .map((hours) => hours / 8)
      .sort((a, b) => a - b);
  } else if (query.scope === StatisticsScope.CYCLE_TIMES) {
    xAxisLabel = "Cycle time (days)";
    for (const activity of activities) {
      if (query.category != null && activity.category !== query.category) {
        continue;
      }

      const cycleTime = activity.finish.since(activity.start).total("days") + 1;
      days.push(cycleTime);
    }
    days = Object.values(days).sort((a, b) => a - b);
  } else {
    throw new Error(`Unknown statistics for ${query.scope}.`);
  }

  const maxDay = days.at(-1) ?? 0;

  const binEdges: number[] = [];
  const frequencies: number[] = [];
  let i = 0;
  while (i < Math.ceil(maxDay)) {
    if (i === 0) {
      binEdges.push(0);
      frequencies.push(0);
      if (query.scope === StatisticsScope.WORKING_HOURS) {
        binEdges.push(0.5);
        frequencies.push(0);
      }
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
  today,
  holidays = [],
  vacations = [],
  capacity = "PT40H",
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: TimesheetQuery;
  today: Temporal.PlainDate;
  holidays?: Holiday[];
  vacations?: Vacation[];
  capacity?: Temporal.DurationLike | string;
}): Promise<TimesheetQueryResult> {
  const startInclusive = query.from;
  const endExclusive = query.to.add("P1D");
  const calendar = Calendar.create({ holidays, vacations, capacity });

  let entries: TimesheetEntry[] = [];
  let totalHours = Temporal.Duration.from("PT0S");
  for await (const event of filterEvents(
    replay,
    startInclusive,
    endExclusive,
  )) {
    updateEntries(event);
    updateTotalHours(event);
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

  function updateEntries(event: ActivityLoggedEvent) {
    const date = event.dateTime.toPlainDate();
    const index = entries.findIndex(
      (entry) =>
        Temporal.PlainDate.compare(entry.date, date.toString()) === 0 &&
        entry.client === event.client &&
        entry.project === event.project &&
        entry.task === event.task,
    );
    if (index === -1) {
      const newEntry: TimesheetEntry = {
        date,
        client: event.client,
        project: event.project,
        task: event.task,
        hours: event.duration,
      };
      entries.push(newEntry);
    } else {
      const existingEntry = entries[index];
      const accumulatedHours = existingEntry.hours.add(event.duration);
      entries[index] = {
        ...existingEntry,
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }

  function updateTotalHours(event: ActivityLoggedEvent) {
    const hours = event.duration;
    totalHours = totalHours.add(hours);
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

export async function projectEstimate({
  replay,
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
}): Promise<EstimateQueryResult> {
  const cycleTimeCounts = new Map<number, number>();
  const activities = await projectActivities(replay);
  for (const activity of activities) {
    const cycleTimeDays =
      activity.finish.since(activity.start).total("days") + 1;
    const frequency = cycleTimeCounts.get(cycleTimeDays) ?? 0;
    cycleTimeCounts.set(cycleTimeDays, frequency + 1);
  }

  const sortedCycleTimes = Array.from(cycleTimeCounts.entries()).sort(
    (a, b) => a[0] - b[0],
  );
  const totalFrequencies = Array.from(cycleTimeCounts.values()).reduce(
    (sum, freq) => sum + freq,
    0,
  );
  let cumulativeProbability = 0;
  const cycleTimes = sortedCycleTimes.map(([cycleTime, frequency]) => {
    const probability = frequency / totalFrequencies;
    cumulativeProbability += probability;
    return {
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    };
  });

  return {
    cycleTimes,
  };
}

async function* filterEvents(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  startInclusive?: Temporal.PlainDate | Temporal.PlainDateLike | string,
  endExclusive?: Temporal.PlainDate | Temporal.PlainDateLike | string,
): AsyncGenerator<ActivityLoggedEvent> {
  for await (const event of replay) {
    const date = event.dateTime.toPlainDate();
    if (
      startInclusive &&
      Temporal.PlainDate.compare(date, startInclusive) < 0
    ) {
      continue;
    }
    if (endExclusive && Temporal.PlainDate.compare(date, endExclusive) >= 0) {
      continue;
    }

    yield event;
  }
}
