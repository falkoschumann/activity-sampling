// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";

import { Temporal } from "@js-temporal/polyfill";
import { expect } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { TimerService } from "../../src/main/application/timer_service";
import { arrayFromAsync } from "../../src/shared/common/polyfills";
import { Clock } from "../../src/shared/common/temporal";
import {
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
  ReportQuery,
  ReportQueryResult,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../src/shared/domain/activities";
import {
  type CurrentIntervalQuery,
  type CurrentIntervalQueryResult,
  type StartTimerCommand,
  StopTimerCommand,
} from "../../src/shared/domain/timer";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../src/main/infrastructure/events";
import { HolidayRepository } from "../../src/main/infrastructure/holiday_repository";

export async function startActivitySampling({
  now = "2025-08-26T14:00:00Z",
  eventsFile = "testdata/events.csv",
  holidayFile = "test/data/holidays.csv",
} = {}): Promise<Ui> {
  await fs.rm(eventsFile, { force: true });

  const clock = Clock.fixed(now, "Europe/Berlin");
  const activitiesDriver = new ActivitiesDriver(eventsFile, holidayFile, clock);
  const timerDriver = new TimerDriver(clock);
  const log = new LogDsl(activitiesDriver, timerDriver);
  const reports = new ReportsDsl(activitiesDriver);
  const timesheet = new TimesheetDsl(activitiesDriver);

  return { log, reports, timesheet };
}

export interface Ui {
  log: LogDsl;
  reports: ReportsDsl;
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
    const timestamp = args.timestamp ?? "2025-08-14T11:00:00Z";
    const duration = args.duration ?? "PT30M";
    const client = args.client ?? "Test client";
    const project = args.project ?? "Test project";
    const task = args.task ?? "Test task";
    const notes = args.notes;
    await this.#activitiesDriver.record({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
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
    const timestamp = args.timestamp ?? "2025-08-14T11:00:00Z";
    const duration = args.duration ?? "PT30M";
    const client = args.client ?? "Test client";
    const project = args.project ?? "Test project";
    const task = args.task ?? "Test task";
    const notes = args.notes;
    await this.#activitiesDriver.record({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
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
    const timestamp = args.timestamp ?? "2025-08-14T11:00:00Z";
    const duration = args.duration ?? "PT30M";
    const client = args.client ?? "Test client";
    const project = args.project ?? "Test project";
    const task = args.task ?? "Test task";
    const notes = args.notes;
    await this.#activitiesDriver.record({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }
}

class ActivitiesDriver {
  readonly #eventStore: EventStore;
  readonly #activitiesService: ActivitiesService;

  #recentActivitiesQueryResult?: RecentActivitiesQueryResult;
  #reportQueryResult?: ReportQueryResult;
  #timesheetQueryResult?: TimesheetQueryResult;

  constructor(eventsFile: string, holidayFile: string, clock: Clock) {
    const eventStore = (this.#eventStore = EventStore.create({
      fileName: eventsFile,
    }));
    const holidayRepository = HolidayRepository.create({
      fileName: holidayFile,
    });
    this.#activitiesService = ActivitiesService.create({
      eventStore,
      holidayRepository,
      clock,
    });
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
      expect(this.#recentActivitiesQueryResult?.workingDays).toEqual(
        result.workingDays,
      );
    }
    if (result.timeSummary) {
      expect(this.#recentActivitiesQueryResult?.timeSummary).toEqual(
        result.timeSummary,
      );
    }
  }

  async queryReport(query: ReportQuery) {
    this.#reportQueryResult = await this.#activitiesService.queryReport(query);
  }

  assertReport(result: Partial<ReportQueryResult>) {
    if (result.entries) {
      expect(this.#reportQueryResult?.entries).toEqual(result.entries);
    }
    if (result.totalHours) {
      expect(this.#reportQueryResult?.totalHours).toEqual(result.totalHours);
    }
  }

  async queryTimesheet(query: TimesheetQuery) {
    this.#timesheetQueryResult =
      await this.#activitiesService.queryTimesheet(query);
  }

  assertTimesheet(result: Partial<TimesheetQueryResult>) {
    if (result.entries) {
      expect(this.#timesheetQueryResult?.entries).toEqual(result.entries);
    }
    if (result.totalHours) {
      expect(this.#timesheetQueryResult?.totalHours).toEqual(result.totalHours);
    }
    if (result.capacity) {
      expect(this.#timesheetQueryResult?.capacity).toEqual(result.capacity);
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
    expect(events.at(-1)).toEqual(event);
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
    expect(this.#currentIntervalQueryResult).toEqual(result);
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
    expect(this.#timerEvents.at(-1)).toEqual(
      expect.objectContaining({
        type: "timerStarted",
        timestamp,
        interval,
      }),
    );
  }

  assertTimerStopped({ timestamp }: { timestamp: Temporal.Instant }) {
    expect(this.#timerEvents.at(-1)).toEqual(
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
