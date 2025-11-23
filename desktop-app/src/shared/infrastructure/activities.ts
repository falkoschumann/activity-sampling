// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Failure, Success } from "@muspellheim/shared";

import {
  ActivityLoggedEvent,
  Capacity,
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
  Histogram,
  LogActivityCommand,
  Median,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  type ReportScopeType,
  StatisticsQuery,
  StatisticsQueryResult,
  type StatisticsScopeType,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/activities";

// region Commands

export class LogActivityCommandDto {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    timestamp: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): LogActivityCommandDto {
    return new LogActivityCommandDto(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static fromModel(model: LogActivityCommand): LogActivityCommandDto {
    return LogActivityCommandDto.create({
      timestamp: model.timestamp.toString(),
      duration: model.duration.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      notes: model.notes,
      category: model.category,
    });
  }

  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    timestamp: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }

  validate(): LogActivityCommand {
    return LogActivityCommand.create(this);
  }
}

export class CommandStatusDto {
  static create({
    isSuccess,
    errorMessage,
  }: {
    isSuccess: boolean;
    errorMessage?: string;
  }): CommandStatusDto {
    return new CommandStatusDto(isSuccess, errorMessage);
  }

  static fromModel(model: CommandStatus): CommandStatusDto {
    if (model.isSuccess) {
      return new CommandStatusDto(true);
    }

    return CommandStatusDto.create({
      isSuccess: model.isSuccess,
      errorMessage: model.errorMessage,
    });
  }

  readonly isSuccess: boolean;
  readonly errorMessage?: string;

  private constructor(isSuccess: boolean, errorMessage?: string) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
  }

  validate(): CommandStatus {
    return this.isSuccess ? new Success() : new Failure(this.errorMessage!);
  }
}

// endregion

// region Queries

export class RecentActivitiesQueryDto {
  static create({ timeZone }: { timeZone?: string }): RecentActivitiesQueryDto {
    return new RecentActivitiesQueryDto(timeZone);
  }

  static fromModel(model: RecentActivitiesQuery): RecentActivitiesQueryDto {
    return RecentActivitiesQueryDto.create({
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly timeZone?: string;

  private constructor(timeZone?: string) {
    this.timeZone = timeZone;
  }

  validate() {
    return RecentActivitiesQuery.create(this);
  }
}

export class RecentActivitiesQueryResultDto {
  static create({
    workingDays,
    timeSummary,
  }: {
    workingDays: WorkingDayDto[];
    timeSummary: TimeSummaryDto;
  }): RecentActivitiesQueryResultDto {
    return new RecentActivitiesQueryResultDto(workingDays, timeSummary);
  }

  static from(
    model: RecentActivitiesQueryResult,
  ): RecentActivitiesQueryResultDto {
    return RecentActivitiesQueryResultDto.create({
      workingDays: model.workingDays.map((workingDay) =>
        WorkingDayDto.from(workingDay),
      ),
      timeSummary: TimeSummaryDto.from(model.timeSummary),
    });
  }

  readonly workingDays: WorkingDayDto[];
  readonly timeSummary: TimeSummaryDto;

  private constructor(
    workingDays: WorkingDayDto[],
    timeSummary: TimeSummaryDto,
  ) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }

  validate() {
    return RecentActivitiesQueryResult.create({
      workingDays: this.workingDays.map((workingDay) =>
        WorkingDayDto.create(workingDay).validate(),
      ),
      timeSummary: TimeSummaryDto.create(this.timeSummary).validate(),
    });
  }
}

export class WorkingDayDto {
  static create({
    date,
    activities,
  }: {
    date: string;
    activities: ActivityLoggedEventDto[];
  }): WorkingDayDto {
    return new WorkingDayDto(date, activities);
  }

  static from(model: WorkingDay): WorkingDayDto {
    return WorkingDayDto.create({
      date: model.date.toString(),
      activities: model.activities.map(
        (activity) => ActivityLoggedEventDto.from(activity)!,
      ),
    });
  }

  readonly date: string;
  readonly activities: ActivityLoggedEventDto[];

  private constructor(date: string, activities: ActivityLoggedEventDto[]) {
    this.date = date;
    this.activities = activities;
  }

  validate(): WorkingDay {
    return WorkingDay.create({
      date: Temporal.PlainDate.from(this.date),
      activities: this.activities.map((dto) =>
        ActivityLoggedEventDto.create(dto)!.validate(),
      ),
    });
  }
}

export class TimeSummaryDto {
  static create({
    hoursToday,
    hoursYesterday,
    hoursThisWeek,
    hoursThisMonth,
  }: {
    hoursToday: string;
    hoursYesterday: string;
    hoursThisWeek: string;
    hoursThisMonth: string;
  }): TimeSummaryDto {
    return new TimeSummaryDto(
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  static from(model: TimeSummary): TimeSummaryDto {
    return TimeSummaryDto.create({
      hoursToday: model.hoursToday.toString(),
      hoursYesterday: model.hoursYesterday.toString(),
      hoursThisWeek: model.hoursThisWeek.toString(),
      hoursThisMonth: model.hoursThisMonth.toString(),
    });
  }

  readonly hoursToday: string;
  readonly hoursYesterday: string;
  readonly hoursThisWeek: string;
  readonly hoursThisMonth: string;

  private constructor(
    hoursToday: string,
    hoursYesterday: string,
    hoursThisWeek: string,
    hoursThisMonth: string,
  ) {
    this.hoursToday = hoursToday;
    this.hoursYesterday = hoursYesterday;
    this.hoursThisWeek = hoursThisWeek;
    this.hoursThisMonth = hoursThisMonth;
  }

  validate(): TimeSummary {
    return TimeSummary.create({
      hoursToday: Temporal.Duration.from(this.hoursToday),
      hoursYesterday: Temporal.Duration.from(this.hoursYesterday),
      hoursThisWeek: Temporal.Duration.from(this.hoursThisWeek),
      hoursThisMonth: Temporal.Duration.from(this.hoursThisMonth),
    });
  }
}

export class ReportQueryDto {
  static create({
    scope,
    from,
    to,
    timeZone,
  }: {
    scope: ReportScopeType;
    from?: string;
    to?: string;
    timeZone?: string;
  }): ReportQueryDto {
    return new ReportQueryDto(scope, from, to, timeZone);
  }

  static from(model: ReportQuery): ReportQueryDto {
    return ReportQueryDto.create({
      scope: model.scope,
      from: model.from?.toString(),
      to: model.to?.toString(),
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly scope: ReportScopeType;
  readonly from?: string;
  readonly to?: string;
  readonly timeZone?: string;

  private constructor(
    scope: ReportScopeType,
    from?: string,
    to?: string,
    timeZone?: string,
  ) {
    this.scope = scope;
    this.from = from;
    this.to = to;
    this.timeZone = timeZone;
  }

  validate(): ReportQuery {
    return ReportQuery.create(this);
  }
}

export class ReportQueryResultDto {
  static create({
    entries,
    totalHours,
  }: {
    entries: ReportEntryDto[];
    totalHours: string;
  }) {
    return new ReportQueryResultDto(entries, totalHours);
  }

  static from(model: ReportQueryResult): ReportQueryResultDto {
    return ReportQueryResultDto.create({
      entries: model.entries.map((entry) => ReportEntryDto.from(entry)),
      totalHours: model.totalHours.toString(),
    });
  }

  readonly entries: ReportEntryDto[];
  readonly totalHours: string;

  private constructor(entries: ReportEntryDto[], totalHours: string) {
    this.entries = entries;
    this.totalHours = totalHours;
  }

  validate(): ReportQueryResult {
    return ReportQueryResult.create({
      entries: this.entries.map((entry) =>
        ReportEntryDto.create(entry).validate(),
      ),
      totalHours: this.totalHours,
    });
  }
}

export class ReportEntryDto {
  static create({
    start,
    finish,
    client,
    project,
    task,
    category,
    hours,
    cycleTime,
  }: {
    start: string;
    finish: string;
    client: string;
    project: string;
    task: string;
    category: string;
    hours: string;
    cycleTime: number;
  }): ReportEntryDto {
    return new ReportEntryDto(
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

  static from(model: ReportEntry): ReportEntryDto {
    return ReportEntryDto.create({
      start: model.start.toString(),
      finish: model.finish.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      category: model.category,
      hours: model.hours.toString(),
      cycleTime: model.cycleTime,
    });
  }

  readonly start: string;
  readonly finish: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category: string;
  readonly hours: string;
  readonly cycleTime: number;

  private constructor(
    start: string,
    finish: string,
    client: string,
    project: string,
    task: string,
    category: string,
    hours: string,
    cycleTime: number,
  ) {
    this.start = start;
    this.finish = finish;
    this.client = client;
    this.project = project;
    this.task = task;
    this.category = category;
    this.hours = hours;
    this.cycleTime = cycleTime;
  }

  validate(): ReportEntry {
    return ReportEntry.create(this);
  }
}

export class StatisticsQueryDto {
  static create({
    scope,
    category,
    timeZone,
  }: {
    scope: StatisticsScopeType;
    category?: string;
    timeZone?: string;
  }): StatisticsQueryDto {
    return new StatisticsQueryDto(scope, category, timeZone);
  }

  static from(model: StatisticsQuery): StatisticsQueryDto {
    return StatisticsQueryDto.create({
      scope: model.scope,
      category: model.category,
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly scope: StatisticsScopeType;
  readonly category?: string;
  readonly timeZone?: string;

  private constructor(
    scope: StatisticsScopeType,
    category?: string,
    timeZone?: string,
  ) {
    this.scope = scope;
    this.category = category;
    this.timeZone = timeZone;
  }

  validate(): StatisticsQuery {
    return StatisticsQuery.create(this);
  }
}

export class StatisticsQueryResultDto {
  static create({
    histogram,
    median,
  }: {
    histogram: {
      binEdges: string[];
      frequencies: number[];
      xAxisLabel: string;
      yAxisLabel: string;
    };
    median: {
      edge0: number;
      edge25: number;
      edge50: number;
      edge75: number;
      edge100: number;
    };
  }): StatisticsQueryResultDto {
    return new StatisticsQueryResultDto(
      HistogramDto.create(histogram),
      MedianDto.create(median),
    );
  }

  static from(model: StatisticsQueryResult): StatisticsQueryResultDto {
    return StatisticsQueryResultDto.create({
      histogram: HistogramDto.from(model.histogram),
      median: MedianDto.from(model.median),
    });
  }

  readonly histogram: HistogramDto;
  readonly median: MedianDto;

  private constructor(histogram: HistogramDto, median: MedianDto) {
    this.histogram = histogram;
    this.median = median;
  }

  validate(): StatisticsQueryResult {
    return StatisticsQueryResult.create({
      histogram: this.histogram.validate(),
      median: this.median.validate(),
    });
  }
}

export class HistogramDto {
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
  }): HistogramDto {
    return new HistogramDto(binEdges, frequencies, xAxisLabel, yAxisLabel);
  }

  static from(model: {
    binEdges: string[];
    frequencies: number[];
    xAxisLabel: string;
    yAxisLabel: string;
  }): HistogramDto {
    return HistogramDto.create({
      binEdges: model.binEdges,
      frequencies: model.frequencies,
      xAxisLabel: model.xAxisLabel,
      yAxisLabel: model.yAxisLabel,
    });
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

  validate(): Histogram {
    return Histogram.create({
      binEdges: this.binEdges,
      frequencies: this.frequencies,
      xAxisLabel: this.xAxisLabel,
      yAxisLabel: this.yAxisLabel,
    });
  }
}

export class MedianDto {
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
    return new MedianDto(edge0, edge25, edge50, edge75, edge100);
  }

  static from(model: Median): MedianDto {
    return MedianDto.create({
      edge0: model.edge0,
      edge25: model.edge25,
      edge50: model.edge50,
      edge75: model.edge75,
      edge100: model.edge100,
    });
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

  validate(): Median {
    return {
      edge0: this.edge0,
      edge25: this.edge25,
      edge50: this.edge50,
      edge75: this.edge75,
      edge100: this.edge100,
    };
  }
}

export class TimesheetQueryDto {
  static create({
    from,
    to,
    timeZone,
  }: {
    from: string;
    to: string;
    timeZone?: string;
  }): TimesheetQueryDto {
    return new TimesheetQueryDto(from, to, timeZone);
  }

  static from(model: TimesheetQuery): TimesheetQueryDto {
    return TimesheetQueryDto.create({
      from: model.from.toString(),
      to: model.to.toString(),
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;

  private constructor(from: string, to: string, timeZone?: string) {
    this.from = from;
    this.to = to;
    this.timeZone = timeZone;
  }

  validate(): TimesheetQuery {
    return TimesheetQuery.create(this);
  }
}

export class TimesheetQueryResultDto {
  static create({
    entries,
    totalHours,
    capacity,
  }: {
    entries: TimesheetEntryDto[];
    totalHours: string;
    capacity: CapacityDto;
  }) {
    return new TimesheetQueryResultDto(entries, totalHours, capacity);
  }

  static from(model: TimesheetQueryResult): TimesheetQueryResultDto {
    return TimesheetQueryResultDto.create({
      entries: model.entries.map((entry) => TimesheetEntryDto.from(entry)),
      totalHours: model.totalHours.toString(),
      capacity: CapacityDto.from(model.capacity),
    });
  }

  readonly entries: TimesheetEntryDto[];
  readonly totalHours: string;
  readonly capacity: CapacityDto;

  private constructor(
    entries: TimesheetEntryDto[],
    totalHours: string,
    capacity: CapacityDto,
  ) {
    this.entries = entries;
    this.totalHours = totalHours;
    this.capacity = capacity;
  }

  validate(): TimesheetQueryResult {
    return TimesheetQueryResult.create({
      entries: this.entries.map((entry) =>
        TimesheetEntryDto.create(entry).validate(),
      ),
      totalHours: Temporal.Duration.from(this.totalHours),
      capacity: CapacityDto.create(this.capacity).validate(),
    });
  }
}

export class TimesheetEntryDto {
  static create({
    date,
    client,
    project,
    task,
    hours,
  }: {
    date: string;
    client: string;
    project: string;
    task: string;
    hours: string;
  }): TimesheetEntryDto {
    return new TimesheetEntryDto(date, client, project, task, hours);
  }

  static from(model: TimesheetEntry): TimesheetEntryDto {
    return TimesheetEntryDto.create({
      date: model.date.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      hours: model.hours.toString(),
    });
  }

  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: string;

  private constructor(
    date: string,
    client: string,
    project: string,
    task: string,
    hours: string,
  ) {
    this.date = date;
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = hours;
  }

  validate(): TimesheetEntry {
    return TimesheetEntry.create(this);
  }
}

export class CapacityDto {
  static create({
    hours,
    offset,
  }: {
    hours: string;
    offset: string;
  }): CapacityDto {
    return new CapacityDto(hours, offset);
  }

  static from(model: Capacity): CapacityDto {
    return CapacityDto.create({
      hours: model.hours.toString(),
      offset: model.offset.toString(),
    });
  }

  readonly hours: string;
  readonly offset: string;

  private constructor(hours: string, offset: string) {
    this.hours = hours;
    this.offset = offset;
  }

  validate(): Capacity {
    return Capacity.create(this);
  }
}

export class EstimateQueryDto {
  static create({
    category,
    timeZone,
  }: {
    category?: string;
    timeZone?: string;
  }): EstimateQueryDto {
    return new EstimateQueryDto(category, timeZone);
  }

  static from(model: EstimateQuery): EstimateQueryDto {
    return EstimateQueryDto.create({
      category: model.category,
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly category?: string;
  readonly timeZone?: string;

  private constructor(category?: string, timeZone?: string) {
    this.category = category;
    this.timeZone = timeZone;
  }

  validate(): EstimateQuery {
    return EstimateQuery.create(this);
  }
}

export class EstimateQueryResultDto {
  static create({
    cycleTimes,
  }: {
    cycleTimes: EstimateEntryDto[];
  }): EstimateQueryResultDto {
    return new EstimateQueryResultDto(
      cycleTimes.map((entry) => EstimateEntryDto.create(entry)),
    );
  }

  static from(model: EstimateQueryResult): EstimateQueryResultDto {
    return EstimateQueryResultDto.create({
      cycleTimes: model.cycleTimes.map((entry) => EstimateEntryDto.from(entry)),
    });
  }

  readonly cycleTimes: EstimateEntryDto[];

  private constructor(cycleTimes: EstimateEntryDto[]) {
    this.cycleTimes = cycleTimes;
  }

  validate(): EstimateQueryResult {
    return EstimateQueryResult.create({
      cycleTimes: this.cycleTimes.map((entry) =>
        EstimateEntryDto.create(entry).validate(),
      ),
    });
  }
}

export class EstimateEntryDto {
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
  }): EstimateEntryDto {
    return new EstimateEntryDto(
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    );
  }

  static from(model: EstimateEntry): EstimateEntryDto {
    return EstimateEntryDto.create({
      cycleTime: model.cycleTime,
      frequency: model.frequency,
      probability: model.probability,
      cumulativeProbability: model.cumulativeProbability,
    });
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

  validate(): EstimateEntry {
    return EstimateEntry.create(this);
  }
}

// endregion

// region Events

export class ActivityLoggedEventDto {
  static create(dto: {
    dateTime: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): ActivityLoggedEventDto {
    return new ActivityLoggedEventDto(
      dto.dateTime,
      dto.duration,
      dto.client,
      dto.project,
      dto.task,
      dto.notes,
      dto.category,
    );
  }

  static from(model: ActivityLoggedEvent): ActivityLoggedEventDto {
    return ActivityLoggedEventDto.create({
      dateTime: model.dateTime.toString(),
      duration: model.duration.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      notes: model.notes,
      category: model.category,
    });
  }

  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    dateTime: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.dateTime = dateTime;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }

  validate(): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      dateTime: Temporal.PlainDateTime.from(this.dateTime),
      duration: Temporal.Duration.from(this.duration),
      client: this.client,
      project: this.project,
      task: this.task,
      notes: this.notes,
      category: this.category,
    });
  }
}
