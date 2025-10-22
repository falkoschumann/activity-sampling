// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import { Temporal } from "@js-temporal/polyfill";
import { expect } from "vitest";

import { arrayFromAsync } from "../../../src/shared/common/polyfills";
import { Clock } from "../../../src/shared/common/temporal";
import { ActivitiesService } from "../../../src/main/application/activities_service";
import { TimerService } from "../../../src/main/application/timer_service";
import {
  Capacity,
  Histogram,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  Statistics,
  StatisticsQuery,
  StatisticsQueryResult,
  type StatisticsType,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  TimeSummary,
  WorkingDay,
} from "../../../src/shared/domain/activities";
import { Holiday, Vacation } from "../../../src/main/domain/calendar";
import { Settings } from "../../../src/shared/domain/settings";
import {
  type CurrentIntervalQuery,
  type CurrentIntervalQueryResult,
  type StartTimerCommand,
  StopTimerCommand,
  TimerStartedEvent,
  TimerStoppedEvent,
} from "../../../src/shared/domain/timer";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";
import { HolidayRepository } from "../../../src/main/infrastructure/holiday_repository";
import { VacationRepository } from "../../../src/main/infrastructure/vacation_repository";

const dataDir = path.resolve(import.meta.dirname, "../../../testdata");

export async function startActivitySampling({
  now = "2025-08-26T14:00:00Z",
} = {}): Promise<Ui> {
  const eventsFile = path.resolve(dataDir, "activity-log.csv");
  await fs.rm(eventsFile, { force: true });
  const holidaysFile = path.resolve(dataDir, "holidays.csv");
  await fs.rm(holidaysFile, { force: true });
  const vacationFile = path.resolve(dataDir, "vacation.csv");
  await fs.rm(vacationFile, { force: true });

  const clock = Clock.fixed(now, "Europe/Berlin");
  const settings = Settings.create({
    ...Settings.createDefault(),
    dataDir,
  });
  const activitiesDriver = new ActivitiesDriver(settings, clock);
  const timerDriver = new TimerDriver(clock);
  const log = new LogDsl(activitiesDriver, timerDriver);
  const reports = new ReportsDsl(activitiesDriver);
  const statistics = new StatisticsDsl(activitiesDriver);
  const timesheet = new TimesheetDsl(activitiesDriver);

  return { log, reports, statistics, timesheet };
}

export interface Ui {
  log: LogDsl;
  reports: ReportsDsl;
  statistics: StatisticsDsl;
  timesheet: TimesheetDsl;
}

class LogDsl {
  readonly #activitiesDriver: ActivitiesDriver;
  readonly #timerDriver: TimerDriver;

  constructor(activitiesDriver: ActivitiesDriver, timerDriver: TimerDriver) {
    this.#activitiesDriver = activitiesDriver;
    this.#timerDriver = timerDriver;
  }

  //
  // Commands
  //

  async startTimer(args: { interval?: string } = {}) {
    const interval = Temporal.Duration.from(args.interval ?? "PT30M");
    await this.#timerDriver.startTimer({ interval });
  }

  async stopTimer() {
    await this.#timerDriver.stopTimer(new StopTimerCommand());
  }

  async logActivity(
    args: {
      timestamp?: string;
      duration?: string;
      client?: string;
      project?: string;
      task?: string;
      notes?: string;
    } = {},
  ) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:00:00Z",
    );
    const duration = Temporal.Duration.from(args.duration ?? "PT30M");
    const client = args.client ?? "Test client";
    const project = args.project ?? "Test project";
    const task = args.task ?? "Test task";
    const notes = args.notes;
    await this.#activitiesDriver.logActivity({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }

  //
  // Queries
  //

  async queryCurrentInterval() {
    await this.#timerDriver.queryCurrentInterval({});
  }

  assertCurrentInterval(args: { timestamp?: string; duration?: string } = {}) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:30:00Z",
    );
    const duration = Temporal.Duration.from(args.duration ?? "PT30M");
    this.#timerDriver.assertCurrentInterval({ timestamp, duration });
  }

  async queryRecentActivities() {
    await this.#activitiesDriver.queryRecentActivities({});
  }

  assertRecentActivities(args: {
    workingDays?: {
      date: string;
      activities: {
        dateTime?: string;
        duration?: string;
        client?: string;
        project?: string;
        task?: string;
        notes?: string;
      }[];
    }[];
    timeSummary?: {
      hoursToday?: string;
      hoursYesterday?: string;
      hoursThisWeek?: string;
      hoursThisMonth?: string;
    };
  }) {
    const workingDays = args.workingDays?.map((workingDay) => ({
      date: Temporal.PlainDate.from(workingDay.date),
      activities: workingDay.activities.map((activity) => ({
        dateTime: Temporal.PlainDateTime.from(
          activity.dateTime ?? "2025-08-14T13:00",
        ),
        duration: Temporal.Duration.from(activity.duration ?? "PT30M"),
        client: activity.client ?? "Test client",
        project: activity.project ?? "Test project",
        task: activity.task ?? "Test task",
        notes: activity.notes,
      })),
    }));
    const timeSummary = args.timeSummary && {
      hoursToday: Temporal.Duration.from(args.timeSummary.hoursToday ?? "PT0S"),
      hoursYesterday: Temporal.Duration.from(
        args.timeSummary.hoursYesterday ?? "PT0S",
      ),
      hoursThisWeek: Temporal.Duration.from(
        args.timeSummary.hoursThisWeek ?? "PT0S",
      ),
      hoursThisMonth: Temporal.Duration.from(
        args.timeSummary.hoursThisMonth ?? "PT0S",
      ),
    };
    this.#activitiesDriver.assertRecentActivities({ workingDays, timeSummary });
  }

  //
  // Events
  //

  async timerStarted(args: { interval?: string } = {}) {
    await this.startTimer(args);
  }

  assertTimerStarted(args: { timestamp?: string; interval?: string } = {}) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:00:00Z",
    );
    const interval = Temporal.Duration.from(args.interval ?? "PT30M");
    this.#timerDriver.assertTimerStarted({ timestamp, interval });
  }

  assertTimerStopped(args: { timestamp?: string } = {}) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:01:00Z",
    );
    this.#timerDriver.assertTimerStopped({ timestamp });
  }

  async intervalElapsed() {
    await this.#timerDriver.intervalElapsed();
  }

  async activityLogged(args: {
    timestamp?: string;
    duration?: string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  }) {
    const event = parseActivityLogged(args);
    await this.#activitiesDriver.record(event);
  }

  async assertActivityLogged(args: {
    timestamp?: string;
    duration?: string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  }) {
    const timestamp = args.timestamp ?? "2025-08-14T11:00:00Z";
    const duration = args.duration ?? "PT30M";
    const client = args.client ?? "Test client";
    const project = args.project ?? "Test project";
    const task = args.task ?? "Test task";
    const notes = args.notes;

    await this.#activitiesDriver.assertActivityLogged(
      ActivityLoggedEventDto.create({
        timestamp,
        duration,
        client,
        project,
        task,
        notes,
      }),
    );
  }

  //
  // Other
  //

  async passTime(args: { duration?: string } = {}) {
    const duration = Temporal.Duration.from(args.duration ?? "PT1M");
    await this.#timerDriver.passTime(duration);
  }
}

class ReportsDsl {
  readonly #activitiesDriver: ActivitiesDriver;

  constructor(activitiesDriver: ActivitiesDriver) {
    this.#activitiesDriver = activitiesDriver;
  }

  //
  // Queries
  //

  async queryReport(
    args: {
      scope?: "Clients" | "Projects" | "Tasks";
      from?: string;
      to?: string;
    } = {},
  ) {
    const scope = args.scope ?? "Clients";
    const from = args.from ? Temporal.PlainDate.from(args.from) : undefined;
    const to = args.to ? Temporal.PlainDate.from(args.to) : undefined;
    await this.#activitiesDriver.queryReport({ scope, from, to });
  }

  assertReport(args: {
    entries?: {
      name?: string;
      hours?: string;
      client?: string;
    }[];
    totalHours?: string;
  }) {
    const entries = args.entries?.map((entry) => ({
      name: entry.name ?? "Test client",
      hours: Temporal.Duration.from(entry.hours ?? "PT30M"),
      client: entry.client,
    }));
    const totalHours = args.totalHours
      ? Temporal.Duration.from(args.totalHours ?? "PT0S")
      : undefined;
    this.#activitiesDriver.assertReport({ entries, totalHours });
  }

  //
  // Events
  //

  async activityLogged(args: {
    timestamp?: string;
    duration?: string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  }) {
    const event = parseActivityLogged(args);
    await this.#activitiesDriver.record(event);
  }
}

class StatisticsDsl {
  #activitiesDriver: ActivitiesDriver;

  constructor(activitiesDriver: ActivitiesDriver) {
    this.#activitiesDriver = activitiesDriver;
  }

  //
  // Queries
  //

  async queryStatistics(args: { statistics?: StatisticsType } = {}) {
    const statistics = args.statistics ?? Statistics.WORKING_HOURS;
    await this.#activitiesDriver.queryStatistics({ statistics });
  }

  assertStatistics(args: {
    histogram?: {
      binEdges: string[];
      frequencies: number[];
    };
    median?: number;
  }) {
    const histogram = args.histogram && {
      binEdges: args.histogram.binEdges,
      frequencies: args.histogram.frequencies,
      xAxisLabel: expect.any(String),
      yAxisLabel: expect.any(String),
    };
    const median =
      args.median != null
        ? {
            edge0: 0,
            edge25: 0,
            edge50: args.median,
            edge75: 0,
            edge100: 0,
          }
        : undefined;

    this.#activitiesDriver.assertStatistics({ histogram, median });
  }

  //
  // Events
  //

  async activityLogged(args: {
    timestamp?: string;
    duration?: string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  }) {
    const event = parseActivityLogged(args);
    await this.#activitiesDriver.record(event);
  }
}

class TimesheetDsl {
  readonly #activitiesDriver: ActivitiesDriver;

  constructor(activitiesDriver: ActivitiesDriver) {
    this.#activitiesDriver = activitiesDriver;
  }

  //
  // Queries
  //

  async queryTimesheet(
    args: {
      from?: string;
      to?: string;
    } = {},
  ) {
    const from = Temporal.PlainDate.from(args.from ?? "2025-08-26");
    const to = Temporal.PlainDate.from(args.to ?? "2025-08-26");
    await this.#activitiesDriver.queryTimesheet({ from, to });
  }

  assertTimesheet(args: {
    entries?: {
      date?: string;
      client?: string;
      project?: string;
      task?: string;
      hours?: string;
    }[];
    totalHours?: string;
    capacity?: {
      hours?: string;
      offset?: string;
    };
  }) {
    const entries = args.entries?.map((entry) => ({
      date: Temporal.PlainDate.from(entry.date ?? "2025-08-26"),
      client: entry.client ?? "Test client",
      project: entry.project ?? "Test project",
      task: entry.task ?? "Test task",
      hours: Temporal.Duration.from(entry.hours ?? "PT30M"),
    }));
    const totalHours = args.totalHours
      ? Temporal.Duration.from(args.totalHours)
      : undefined;
    const capacity = args.capacity && {
      hours: Temporal.Duration.from(args.capacity.hours ?? "PT8H"),
      offset: Temporal.Duration.from(args.capacity.offset ?? "PT7H30M"),
    };
    this.#activitiesDriver.assertTimesheet({
      entries,
      totalHours,
      capacity,
    });
  }

  //
  // Events
  //

  async activityLogged(args: {
    timestamp?: string;
    duration?: string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
  }) {
    const event = parseActivityLogged(args);
    await this.#activitiesDriver.record(event);
  }

  async holidaysChanged(args: {
    holidays: ({ date: string; duration: string } | string)[];
  }) {
    const holidays: Holiday[] = args.holidays.map((holiday) => {
      const date = typeof holiday === "string" ? holiday : holiday.date;
      const duration =
        typeof holiday === "string" ? undefined : holiday.duration;
      return Holiday.create({ date, title: "Holiday", duration });
    });
    await this.#activitiesDriver.holidaysChanged({ holidays });
  }

  async vacationChanged(args: {
    vacations: ({ date: string; duration: string } | string)[];
  }) {
    const vacations: Vacation[] = args.vacations.map((vacation) => {
      const date = typeof vacation === "string" ? vacation : vacation.date;
      const duration =
        typeof vacation === "string" ? undefined : vacation.duration;
      return Vacation.create({ date, duration });
    });
    await this.#activitiesDriver.vacationsChanged({ vacations });
  }
}

function parseActivityLogged(args: {
  timestamp?: string;
  duration?: string;
  client?: string;
  project?: string;
  task?: string;
  notes?: string;
}) {
  const timestamp = args.timestamp ?? "2025-08-14T11:00:00Z";
  const duration = args.duration ?? "PT30M";
  const client = args.client ?? "Test client";
  const project = args.project ?? "Test project";
  const task = args.task ?? "Test task";
  const notes = args.notes;
  return ActivityLoggedEventDto.create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
  });
}

class ActivitiesDriver {
  readonly #eventStore: EventStore;
  readonly #holidayRepository: HolidayRepository;
  readonly #vacationRepository: VacationRepository;
  readonly #activitiesService: ActivitiesService;

  #recentActivitiesQueryResult?: RecentActivitiesQueryResult;
  #reportQueryResult?: ReportQueryResult;
  #statisticsQueryResult?: StatisticsQueryResult;
  #timesheetQueryResult?: TimesheetQueryResult;

  constructor(settings: Settings, clock: Clock) {
    this.#eventStore = EventStore.create();
    this.#holidayRepository = HolidayRepository.create();
    this.#vacationRepository = VacationRepository.create();
    this.#activitiesService = new ActivitiesService(
      settings,
      this.#eventStore,
      this.#holidayRepository,
      this.#vacationRepository,
      clock,
    );
  }

  //
  // Commands
  //

  async logActivity(command: LogActivityCommand) {
    await this.#activitiesService.logActivity(command);
  }

  //
  // Queries
  //

  async queryRecentActivities(query: RecentActivitiesQuery) {
    this.#recentActivitiesQueryResult =
      await this.#activitiesService.queryRecentActivities(query);
  }

  assertRecentActivities(result: Partial<RecentActivitiesQueryResult>) {
    if (result.workingDays) {
      expect(this.#recentActivitiesQueryResult?.workingDays).toEqual<
        WorkingDay[]
      >(result.workingDays);
    }
    if (result.timeSummary) {
      expect(
        this.#recentActivitiesQueryResult?.timeSummary,
      ).toEqual<TimeSummary>(result.timeSummary);
    }
  }

  async queryReport(query: ReportQuery) {
    this.#reportQueryResult = await this.#activitiesService.queryReport(query);
  }

  assertReport(result: Partial<ReportQueryResult>) {
    if (result.entries) {
      expect(this.#reportQueryResult?.entries).toEqual<ReportEntry[]>(
        result.entries,
      );
    }
    if (result.totalHours) {
      expect(this.#reportQueryResult?.totalHours).toEqual<Temporal.Duration>(
        result.totalHours,
      );
    }
  }

  async queryStatistics(query: StatisticsQuery) {
    this.#statisticsQueryResult =
      await this.#activitiesService.queryStatistics(query);
  }

  assertStatistics(result: Partial<StatisticsQueryResult>) {
    if (result.histogram) {
      expect(this.#statisticsQueryResult?.histogram).toEqual<Histogram>(
        result.histogram,
      );
    }
    if (result.median) {
      expect(this.#statisticsQueryResult?.median.edge50).toBe(
        result.median.edge50,
      );
    }
  }

  async queryTimesheet(query: TimesheetQuery) {
    this.#timesheetQueryResult =
      await this.#activitiesService.queryTimesheet(query);
  }

  assertTimesheet(result: Partial<TimesheetQueryResult>) {
    if (result.entries) {
      expect(this.#timesheetQueryResult?.entries).toEqual<TimesheetEntry[]>(
        result.entries,
      );
    }
    if (result.totalHours) {
      expect(this.#timesheetQueryResult?.totalHours).toEqual<Temporal.Duration>(
        result.totalHours,
      );
    }
    if (result.capacity) {
      expect(this.#timesheetQueryResult?.capacity).toEqual<Capacity>(
        result.capacity,
      );
    }
  }

  //
  // Events
  //

  async record(event: unknown) {
    await this.#eventStore.record(event);
  }

  async assertActivityLogged(event: ActivityLoggedEventDto) {
    const events = await arrayFromAsync(this.#eventStore.replay());
    expect(events.at(-1)).toEqual<ActivityLoggedEventDto>(event);
  }

  async holidaysChanged({ holidays }: { holidays: Holiday[] }) {
    await this.#holidayRepository.saveAll(holidays);
  }

  async vacationsChanged({ vacations }: { vacations: Vacation[] }) {
    await this.#vacationRepository.saveAll(vacations);
  }
}

class TimerDriver {
  readonly #timerService: TimerService;

  #currentIntervalQueryResult?: CurrentIntervalQueryResult;
  readonly #timerEvents: Event[] = [];

  constructor(clock: Clock) {
    this.#timerService = TimerService.create({ clock });

    this.#timerService.addEventListener("timerStarted", (event) =>
      this.#timerEvents.push(event),
    );
    this.#timerService.addEventListener("timerStopped", (event) =>
      this.#timerEvents.push(event),
    );
  }

  //
  // Commands
  //

  async startTimer(command: StartTimerCommand) {
    await this.#timerService.startTimer(command);
  }

  async stopTimer(command: StopTimerCommand) {
    await this.#timerService.stopTimer(command);
  }

  //
  // Queries
  //

  async queryCurrentInterval(query: CurrentIntervalQuery) {
    this.#currentIntervalQueryResult =
      await this.#timerService.queryCurrentInterval(query);
  }

  assertCurrentInterval(result: CurrentIntervalQueryResult) {
    expect(
      this.#currentIntervalQueryResult,
    ).toEqual<CurrentIntervalQueryResult>(result);
  }

  //
  // Events
  //

  assertTimerStarted({
    timestamp,
    interval,
  }: {
    timestamp: Temporal.Instant;
    interval: Temporal.Duration;
  }) {
    expect(this.#timerEvents.at(-1)).toEqual<TimerStartedEvent>(
      expect.objectContaining({
        type: "timerStarted",
        timestamp,
        interval,
      }),
    );
  }

  assertTimerStopped({ timestamp }: { timestamp: Temporal.Instant }) {
    expect(this.#timerEvents.at(-1)).toEqual<TimerStoppedEvent>(
      expect.objectContaining({
        type: "timerStopped",
        timestamp,
      }),
    );
  }

  async intervalElapsed() {
    await this.#timerService.simulateIntervalElapsed();
  }

  //
  // Common
  //

  async passTime(duration: Temporal.Duration) {
    await this.#timerService.simulateTimePassing(duration);
  }
}
