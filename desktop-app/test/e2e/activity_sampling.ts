// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import fs from "node:fs/promises";
import { expect } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { TimerService } from "../../src/main/application/timer_service";
import {
  type CommandStatus,
  createSuccess,
} from "../../src/main/common/messages";
import { arrayFromAsync } from "../../src/main/common/polyfills";
import { Clock } from "../../src/main/common/temporal";
import {
  createTestActivity,
  createTestLogActivityCommand,
  type RecentActivitiesQueryResult,
} from "../../src/main/domain/activities";
import {
  type CurrentIntervalQuery,
  type CurrentIntervalQueryResult,
} from "../../src/main/domain/timer";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../src/main/infrastructure/events";

export function createActivitySampling({ now = "2025-08-26T14:00:00Z" } = {}): {
  log: LogDsl;
} {
  const clock = Clock.fixed(now, "Europe/Berlin");
  const log = new LogDsl(new LogDriver(clock));
  return { log };
}

class LogDsl {
  readonly #logDriver: LogDriver;

  constructor(driver: LogDriver) {
    this.#logDriver = driver;
  }

  startTimer(args: { interval?: string } = {}) {
    const interval = Temporal.Duration.from(args.interval ?? "PT30M");
    this.#logDriver.startTimer(interval);
  }

  stopTimer() {
    this.#logDriver.stopTimer();
  }

  assertCommandWasSuccessful() {
    this.#logDriver.assertCommandWasSuccessful();
  }

  queryCurrentInterval() {
    this.#logDriver.queryCurrentInterval({});
  }

  assertCurrentInterval(args: { timestamp?: string; duration?: string } = {}) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:30:00Z",
    );
    const duration = Temporal.Duration.from(args.duration ?? "PT30M");
    this.#logDriver.assertCurrentInterval(timestamp, duration);
  }

  assertTimerStarted(args: { timestamp?: string; interval?: string } = {}) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:00:00Z",
    );
    const interval = Temporal.Duration.from(args.interval ?? "PT30M");
    this.#logDriver.assertTimerStarted(timestamp, interval);
  }

  assertTimerStopped(args: { timestamp?: string } = {}) {
    const timestamp = Temporal.Instant.from(
      args.timestamp ?? "2025-08-26T14:01:00Z",
    );
    this.#logDriver.assertTimerStopped(timestamp);
  }

  intervalElapsed() {
    this.#logDriver.intervalElapsed();
  }

  passTime(args: { duration?: string } = {}) {
    const duration = Temporal.Duration.from(args.duration ?? "PT1M");
    this.#logDriver.passTime(duration);
  }
}

class LogDriver {
  readonly #timerService: TimerService;

  #commandStatus?: CommandStatus;
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

  startTimer(interval: Temporal.Duration) {
    this.#commandStatus = this.#timerService.startTimer({ interval });
  }

  stopTimer() {
    this.#commandStatus = this.#timerService.stopTimer({});
  }

  assertCommandWasSuccessful() {
    expect(this.#commandStatus).toEqual(createSuccess());
  }

  queryCurrentInterval(query: CurrentIntervalQuery) {
    this.#currentIntervalQueryResult =
      this.#timerService.queryCurrentInterval(query);
  }

  assertCurrentInterval(
    timestamp: Temporal.Instant,
    duration: Temporal.Duration,
  ) {
    expect(this.#currentIntervalQueryResult).toEqual({ timestamp, duration });
  }

  assertTimerStarted(timestamp: Temporal.Instant, interval: Temporal.Duration) {
    expect(this.#timerEvents).toEqual([
      expect.objectContaining({
        type: "timerStarted",
        timestamp,
        interval,
      }),
    ]);
  }

  assertTimerStopped(timestamp: Temporal.Instant) {
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

  passTime(duration: Temporal.Duration) {
    this.#timerService.clock = Clock.offset(this.#timerService.clock, duration);
  }
}

export class ActivitySamplingDsl {
  // TODO Move to LogDsl/LogDriver

  readonly #fileName: string;
  readonly #eventStore: EventStore;
  readonly #activitiesService: ActivitiesService;

  #commandStatus?: CommandStatus;
  #recentActivitiesQueryResult?: RecentActivitiesQueryResult;

  constructor({
    fileName = "testdata/events.csv",
    fixedClock = "2025-08-26T14:00:00Z",
  } = {}) {
    this.#fileName = fileName;
    const clock = Clock.fixed(fixedClock, "Europe/Berlin");
    const eventStore = (this.#eventStore = EventStore.create({ fileName }));
    this.#activitiesService = ActivitiesService.create({ eventStore, clock });
  }

  async start() {
    await fs.rm(this.#fileName, { force: true });
  }

  async logActivity({ timestamp }: { timestamp: string }) {
    const command = createTestLogActivityCommand({ timestamp });
    this.#commandStatus = await this.#activitiesService.logActivity(command);
  }

  assertCommandWasSuccessful() {
    expect(this.#commandStatus).toEqual(createSuccess());
  }

  async queryRecentActivities() {
    this.#recentActivitiesQueryResult =
      await this.#activitiesService.queryRecentActivities({});
  }

  assertRecentActivities({
    lastActivity,
    workingDays,
    timeSummary,
  }: {
    lastActivity: string;
    workingDays: { date: string; activities: string[] }[];
    timeSummary: {
      hoursToday: string;
      hoursYesterday: string;
      hoursThisWeek: string;
      hoursThisMonth: string;
    };
  }) {
    expect(this.#recentActivitiesQueryResult).toEqual({
      lastActivity: createTestActivity({ dateTime: lastActivity }),
      workingDays: workingDays.map((workingDay) => ({
        date: workingDay.date,
        activities: workingDay.activities.map((activity) =>
          createTestActivity({ dateTime: activity }),
        ),
      })),
      timeSummary,
    });
  }

  async activityLogged({ timestamp }: { timestamp: string }) {
    await this.#eventStore.record(
      ActivityLoggedEvent.createTestData({ timestamp }),
    );
  }

  async assertActivityLogged({ timestamp }: { timestamp: string }) {
    const events = await arrayFromAsync(this.#eventStore.replay());
    expect(events).toEqual([ActivityLoggedEvent.createTestData({ timestamp })]);
  }
}
