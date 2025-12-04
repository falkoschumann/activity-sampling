// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

// region Commands

export class LogActivityCommand {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    timestamp: Temporal.Instant | string;
    duration: Temporal.DurationLike | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): LogActivityCommand {
    return new LogActivityCommand(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static createTestInstance({
    timestamp = "2025-08-14T11:00:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
  }: {
    timestamp?: Temporal.Instant | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
  } = {}): LogActivityCommand {
    return LogActivityCommand.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
    });
  }

  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.timestamp = Temporal.Instant.from(timestamp);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }
}

// endregion

// region Queries

export class RecentActivitiesQuery {
  static create({
    timeZone,
  }: {
    timeZone?: Temporal.TimeZoneLike;
  }): RecentActivitiesQuery {
    return new RecentActivitiesQuery(timeZone);
  }

  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(timeZone?: Temporal.TimeZoneLike) {
    this.timeZone = timeZone;
  }
}

export class RecentActivitiesQueryResult {
  static create({
    workingDays,
    timeSummary,
  }: {
    workingDays: WorkingDay[];
    timeSummary: TimeSummary;
  }): RecentActivitiesQueryResult {
    return new RecentActivitiesQueryResult(workingDays, timeSummary);
  }

  static empty(): RecentActivitiesQueryResult {
    return RecentActivitiesQueryResult.create({
      workingDays: [],
      timeSummary: {
        hoursToday: Temporal.Duration.from("PT0S"),
        hoursYesterday: Temporal.Duration.from("PT0S"),
        hoursThisWeek: Temporal.Duration.from("PT0S"),
        hoursThisMonth: Temporal.Duration.from("PT0S"),
      },
    });
  }

  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;

  private constructor(workingDays: WorkingDay[], timeSummary: TimeSummary) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }
}

export class WorkingDay {
  static create({
    date,
    activities,
  }: {
    date: Temporal.PlainDateLike | string;
    activities: ActivityLoggedEvent[];
  }): WorkingDay {
    return new WorkingDay(date, activities);
  }

  readonly date: Temporal.PlainDate;
  readonly activities: ActivityLoggedEvent[];

  private constructor(
    date: Temporal.PlainDateLike | string,
    activities: ActivityLoggedEvent[],
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.activities = activities;
  }
}

export class TimeSummary {
  static create({
    hoursToday,
    hoursYesterday,
    hoursThisWeek,
    hoursThisMonth,
  }: {
    hoursToday: Temporal.DurationLike | string;
    hoursYesterday: Temporal.DurationLike | string;
    hoursThisWeek: Temporal.DurationLike | string;
    hoursThisMonth: Temporal.DurationLike | string;
  }): TimeSummary {
    return new TimeSummary(
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  readonly hoursToday: Temporal.Duration;
  readonly hoursYesterday: Temporal.Duration;
  readonly hoursThisWeek: Temporal.Duration;
  readonly hoursThisMonth: Temporal.Duration;

  private constructor(
    hoursToday: Temporal.DurationLike | string,
    hoursYesterday: Temporal.DurationLike | string,
    hoursThisWeek: Temporal.DurationLike | string,
    hoursThisMonth: Temporal.DurationLike | string,
  ) {
    this.hoursToday = Temporal.Duration.from(hoursToday);
    this.hoursYesterday = Temporal.Duration.from(hoursYesterday);
    this.hoursThisWeek = Temporal.Duration.from(hoursThisWeek);
    this.hoursThisMonth = Temporal.Duration.from(hoursThisMonth);
  }
}

export class ReportQuery {
  static create({
    scope,
    from,
    to,
    timeZone,
  }: {
    scope: ReportScopeType;
    from?: Temporal.PlainDateLike | string;
    to?: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  }): ReportQuery {
    return new ReportQuery(scope, from, to, timeZone);
  }

  readonly scope: ReportScopeType;
  readonly from?: Temporal.PlainDate;
  readonly to?: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    scope: ReportScopeType,
    from?: Temporal.PlainDateLike | string,
    to?: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.scope = scope;
    this.from = from ? Temporal.PlainDate.from(from) : undefined;
    this.to = to ? Temporal.PlainDate.from(to) : undefined;
    this.timeZone = timeZone;
  }
}

export const ReportScope = Object.freeze({
  CLIENTS: "Clients",
  PROJECTS: "Projects",
  TASKS: "Tasks",
  CATEGORIES: "Categories",
});

export type ReportScopeType = (typeof ReportScope)[keyof typeof ReportScope];

export class ReportQueryResult {
  static create({
    entries,
    totalHours,
  }: {
    entries: ReportEntry[];
    totalHours: Temporal.DurationLike | string;
  }): ReportQueryResult {
    return new ReportQueryResult(entries, totalHours);
  }

  static empty(): ReportQueryResult {
    return ReportQueryResult.create({
      entries: [],
      totalHours: Temporal.Duration.from("PT0S"),
    });
  }

  readonly entries: ReportEntry[];
  readonly totalHours: Temporal.Duration;

  private constructor(
    entries: ReportEntry[],
    totalHours: Temporal.DurationLike | string,
  ) {
    this.entries = entries;
    this.totalHours = Temporal.Duration.from(totalHours);
  }
}

export class ReportEntry {
  static create({
    start,
    finish,
    client = "",
    project = "",
    task = "",
    category = "",
    hours,
    cycleTime,
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client?: string;
    project?: string;
    task?: string;
    category?: string;
    hours: Temporal.DurationLike | string;
    cycleTime: number;
  }): ReportEntry {
    return new ReportEntry(
      start,
      finish,
      client,
      project,
      task,
      category,
      hours,
      cycleTime,
    );
  }

  static createTestInstance({
    start = Temporal.PlainDate.from("2025-11-19"),
    finish = Temporal.PlainDate.from("2025-11-19"),
    client = "Test client",
    project,
    task,
    category,
    hours = Temporal.Duration.from("PT8H"),
    cycleTime = 1,
  }: Partial<ReportEntry> = {}): ReportEntry {
    return ReportEntry.create({
      start,
      finish,
      client,
      project,
      task,
      category,
      hours,
      cycleTime,
    });
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category: string;
  readonly hours: Temporal.Duration;
  readonly cycleTime: number;

  private constructor(
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    category: string,
    hours: Temporal.DurationLike | string,
    cycleTime: number,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.category = category;
    this.hours = Temporal.Duration.from(hours);
    this.cycleTime = cycleTime;
  }
}

export const StatisticsScope = Object.freeze({
  WORKING_HOURS: "Working hours",
  CYCLE_TIMES: "Cycle times",
});

export type StatisticsScopeType =
  (typeof StatisticsScope)[keyof typeof StatisticsScope];

export class StatisticsQuery {
  static create({
    scope,
    category,
    timeZone,
  }: {
    scope: StatisticsScopeType;
    category?: string;
    timeZone?: Temporal.TimeZoneLike;
  }): StatisticsQuery {
    return new StatisticsQuery(scope, category, timeZone);
  }

  readonly scope: StatisticsScopeType;
  readonly category?: string;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    scope: StatisticsScopeType,
    category?: string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.scope = scope;
    this.category = category;
    this.timeZone = timeZone;
  }
}

export class StatisticsQueryResult {
  static create({
    histogram,
    median,
    categories,
    totalCount,
  }: {
    histogram: Histogram;
    median: Median;
    categories: string[];
    totalCount: number;
  }): StatisticsQueryResult {
    return new StatisticsQueryResult(
      Histogram.create(histogram),
      Median.create(median),
      categories,
      totalCount,
    );
  }

  static empty(): StatisticsQueryResult {
    return StatisticsQueryResult.create({
      histogram: Histogram.create({
        binEdges: [],
        frequencies: [],
        xAxisLabel: "",
        yAxisLabel: "",
      }),
      median: { edge0: 0, edge25: 0, edge50: 0, edge75: 0, edge100: 0 },
      categories: [],
      totalCount: 0,
    });
  }

  readonly histogram: Histogram;
  readonly median: Median;
  readonly categories: string[];
  readonly totalCount: number;

  private constructor(
    histogram: Histogram,
    median: Median,
    categories: string[],
    totalCount: number,
  ) {
    this.histogram = histogram;
    this.median = median;
    this.categories = categories;
    this.totalCount = totalCount;
  }
}

export class Histogram {
  static create({
    binEdges,
    frequencies,
    xAxisLabel,
    yAxisLabel,
  }: {
    binEdges: string[];
    frequencies: number[];
    xAxisLabel: string;
    yAxisLabel: string;
  }) {
    return new Histogram(binEdges, frequencies, xAxisLabel, yAxisLabel);
  }

  readonly binEdges: string[];
  readonly frequencies: number[];
  readonly xAxisLabel: string;
  readonly yAxisLabel: string;

  private constructor(
    binEdges: string[],
    frequencies: number[],
    xAxisLabel: string,
    yAxisLabel: string,
  ) {
    this.binEdges = binEdges;
    this.frequencies = frequencies;
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
  }
}

export class Median {
  static create({
    edge0,
    edge25,
    edge50,
    edge75,
    edge100,
  }: {
    edge0: number;
    edge25: number;
    edge50: number;
    edge75: number;
    edge100: number;
  }) {
    return new Median(edge0, edge25, edge50, edge75, edge100);
  }

  readonly edge0: number;
  readonly edge25: number;
  readonly edge50: number;
  readonly edge75: number;
  readonly edge100: number;

  private constructor(
    edge0: number,
    edge25: number,
    edge50: number,
    edge75: number,
    edge100: number,
  ) {
    this.edge0 = edge0;
    this.edge25 = edge25;
    this.edge50 = edge50;
    this.edge75 = edge75;
    this.edge100 = edge100;
  }
}

export class TimesheetQuery {
  static create({
    from,
    to,
    timeZone,
  }: {
    from: Temporal.PlainDateLike | string;
    to: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  }): TimesheetQuery {
    return new TimesheetQuery(from, to, timeZone);
  }

  readonly from: Temporal.PlainDate;
  readonly to: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.from = Temporal.PlainDate.from(from);
    this.to = Temporal.PlainDate.from(to);
    this.timeZone = timeZone;
  }
}

export class TimesheetQueryResult {
  static create({
    entries,
    totalHours,
    capacity,
  }: {
    entries: TimesheetEntry[];
    totalHours: Temporal.DurationLike | string;
    capacity: Capacity;
  }): TimesheetQueryResult {
    return new TimesheetQueryResult(entries, totalHours, capacity);
  }

  static empty(): TimesheetQueryResult {
    return TimesheetQueryResult.create({
      entries: [],
      totalHours: Temporal.Duration.from("PT0S"),
      capacity: Capacity.empty(),
    });
  }

  readonly entries: TimesheetEntry[];
  readonly totalHours: Temporal.Duration;
  readonly capacity: Capacity;

  private constructor(
    entries: TimesheetEntry[],
    totalHours: Temporal.DurationLike | string,
    capacity: Capacity,
  ) {
    this.entries = entries;
    this.totalHours = Temporal.Duration.from(totalHours);
    this.capacity = capacity;
  }
}

export class TimesheetEntry {
  static create({
    date,
    client,
    project,
    task,
    hours,
  }: {
    date: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
    hours: Temporal.DurationLike | string;
  }): TimesheetEntry {
    return new TimesheetEntry(date, client, project, task, hours);
  }

  static createTestInstance({
    date = Temporal.PlainDate.from("2025-06-04"),
    client = "Test client",
    project = "Test project",
    task = "Test task",
    hours = Temporal.Duration.from("PT2H"),
  }: Partial<TimesheetEntry> = {}): TimesheetEntry {
    return TimesheetEntry.create({ date, client, project, task, hours });
  }

  readonly date: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;

  private constructor(
    date: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike | string,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = Temporal.Duration.from(hours);
  }
}

export class Capacity {
  static create({
    hours,
    offset,
  }: {
    hours: Temporal.DurationLike | string;
    offset: Temporal.DurationLike | string;
  }): Capacity {
    return new Capacity(hours, offset);
  }

  static empty(): Capacity {
    return Capacity.create({
      hours: Temporal.Duration.from("PT40H"),
      offset: Temporal.Duration.from("-PT40H"),
    });
  }

  readonly hours: Temporal.Duration;
  readonly offset: Temporal.Duration;

  private constructor(
    hours: Temporal.DurationLike | string,
    offset: Temporal.DurationLike | string,
  ) {
    this.hours = Temporal.Duration.from(hours);
    this.offset = Temporal.Duration.from(offset);
  }
}

export class EstimateQuery {
  static create({
    category,
    timeZone,
  }: {
    category?: string;
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new EstimateQuery(category, timeZone);
  }

  readonly category?: string;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(category?: string, timeZone?: Temporal.TimeZoneLike) {
    this.category = category;
    this.timeZone = timeZone;
  }
}

export class EstimateQueryResult {
  static create({ cycleTimes }: { cycleTimes: EstimateEntry[] }) {
    return new EstimateQueryResult(
      cycleTimes.map((entry) => EstimateEntry.create(entry)),
    );
  }

  static empty() {
    return EstimateQueryResult.create({
      cycleTimes: [],
    });
  }

  readonly cycleTimes: EstimateEntry[];

  private constructor(cycleTimes: EstimateEntry[]) {
    this.cycleTimes = cycleTimes;
  }
}

export class EstimateEntry {
  static create({
    cycleTime,
    frequency,
    probability,
    cumulativeProbability,
  }: {
    cycleTime: number;
    frequency: number;
    probability: number;
    cumulativeProbability: number;
  }): EstimateEntry {
    return new EstimateEntry(
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    );
  }

  readonly cycleTime: number;
  readonly frequency: number;
  readonly probability: number;
  readonly cumulativeProbability: number;

  private constructor(
    cycleTime: number,
    frequency: number,
    probability: number,
    cumulativeProbability: number,
  ) {
    this.cycleTime = cycleTime;
    this.frequency = frequency;
    this.probability = probability;
    this.cumulativeProbability = cumulativeProbability;
  }
}

// endregion

// region Events

export class ActivityLoggedEvent {
  static create({
    dateTime,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    dateTime: Temporal.PlainDateTimeLike | string;
    duration: Temporal.DurationLike | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): ActivityLoggedEvent {
    return new ActivityLoggedEvent(
      dateTime,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static createTestInstance({
    dateTime = "2025-08-14T13:00",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
  }: {
    dateTime?: Temporal.PlainDateTimeLike | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
  } = {}): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      dateTime,
      duration,
      client,
      project,
      task,
      notes,
      category,
    });
  }

  readonly dateTime: Temporal.PlainDateTime;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    dateTime: Temporal.PlainDateTimeLike | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.dateTime = Temporal.PlainDateTime.from(dateTime);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }
}
