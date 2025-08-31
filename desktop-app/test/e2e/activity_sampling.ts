// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import fs from "node:fs";
import { expect } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { TimerService } from "../../src/main/application/timer_service";
import { arrayFromAsync } from "../../src/main/common/polyfills";
import { Clock } from "../../src/main/common/temporal";
import {
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
} from "../../src/main/domain/activities";
import {
  type CurrentIntervalQuery,
  type CurrentIntervalQueryResult,
  type StartTimerCommand,
  StopTimerCommand,
} from "../../src/main/domain/timer";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../src/main/infrastructure/events";

export function createActivitySampling({
  now = "2025-08-26T14:00:00Z",
  eventsFile = "testdata/events.csv",
} = {}): {
  log: LogDsl;
} {
  const clock = Clock.fixed(now, "Europe/Berlin");
  const log = new LogDsl(
    new ActivitiesDriver(eventsFile, clock),
    new TimerDriver(clock),
  );

  fs.rmSync(eventsFile, { force: true });

  return { log };
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

  startTimer(args: { interval?: string } = {}) {
    const interval = Temporal.Duration.from(args.interval ?? "PT30M");
    this.#timerDriver.startTimer({ interval });
  }

  stopTimer() {
    this.#timerDriver.stopTimer(new StopTimerCommand());
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

  queryCurrentInterval() {
    this.#timerDriver.queryCurrentInterval({});
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
    lastActivity: {
      dateTime?: string;
      duration?: string;
      client?: string;
      project?: string;
      task?: string;
      notes?: string;
    };
    workingDays: {
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
    timeSummary: {
      hoursToday?: string;
      hoursYesterday?: string;
      hoursThisWeek?: string;
      hoursThisMonth?: string;
    };
  }) {
    const lastActivity = {
      dateTime: Temporal.PlainDateTime.from(
        args.lastActivity.dateTime ?? "2025-08-14T13:00",
      ),
      duration: Temporal.Duration.from(args.lastActivity.duration ?? "PT30M"),
      client: args.lastActivity.client ?? "Test client",
      project: args.lastActivity.project ?? "Test project",
      task: args.lastActivity.task ?? "Test task",
      notes: args.lastActivity.notes,
    };
    const workingDays = args.workingDays.map((workingDay) => ({
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
    const timeSummary = {
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
    this.#activitiesDriver.assertRecentActivities({
      lastActivity,
      workingDays,
      timeSummary,
    });
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

  intervalElapsed() {
    this.#timerDriver.intervalElapsed();
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

    await this.#activitiesDriver.assertActivityLogged({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }

  //
  // Common
  //

  passTime(args: { duration?: string } = {}) {
    const duration = Temporal.Duration.from(args.duration ?? "PT1M");
    this.#timerDriver.passTime(duration);
  }
}

class ActivitiesDriver {
  readonly #eventStore: EventStore;
  readonly #activitiesService: ActivitiesService;

  #recentActivitiesQueryResult?: RecentActivitiesQueryResult;

  constructor(eventsFile: string, clock: Clock) {
    const eventStore = (this.#eventStore = EventStore.create({
      fileName: eventsFile,
    }));
    this.#activitiesService = ActivitiesService.create({ eventStore, clock });
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

  assertRecentActivities(result: RecentActivitiesQueryResult) {
    expect(this.#recentActivitiesQueryResult).toEqual(result);
  }

  //
  // Events
  //

  async record(event: unknown) {
    await this.#eventStore.record(event);
  }

  async assertActivityLogged(event: ActivityLoggedEvent) {
    const events = await arrayFromAsync(this.#eventStore.replay());
    expect(events).toEqual([event]);
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

  startTimer(command: StartTimerCommand) {
    this.#timerService.startTimer(command);
  }

  stopTimer(command: StopTimerCommand) {
    this.#timerService.stopTimer(command);
  }

  //
  // Queries
  //

  queryCurrentInterval(query: CurrentIntervalQuery) {
    this.#currentIntervalQueryResult =
      this.#timerService.queryCurrentInterval(query);
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
    expect(this.#timerEvents).toEqual([
      expect.objectContaining({
        type: "timerStarted",
        timestamp,
        interval,
      }),
    ]);
  }

  assertTimerStopped({ timestamp }: { timestamp: Temporal.Instant }) {
    expect(this.#timerEvents).toEqual([
      expect.objectContaining({
        type: "timerStopped",
        timestamp,
      }),
    ]);
  }

  intervalElapsed() {
    this.#timerService.simulateIntervalElapsed();
  }

  //
  // Common
  //

  passTime(duration: Temporal.Duration) {
    this.#timerService.clock = Clock.offset(this.#timerService.clock, duration);
  }
}
