// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export interface StartTimerCommand {
  readonly interval: Temporal.DurationLike | string;
}

export type StopTimerCommand = object;

export type CurrentIntervalQuery = object;

export interface CurrentIntervalQueryResult {
  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.DurationLike;
}

export class TimerStartedEvent extends Event {
  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.DurationLike;

  constructor(
    timestamp: Temporal.Instant | string,
    interval: Temporal.DurationLike | string,
  ) {
    super("timerStarted");
    this.timestamp = Temporal.Instant.from(timestamp);
    this.interval = Temporal.Duration.from(interval);
  }
}

export class TimerStoppedEvent extends Event {
  readonly timestamp: Temporal.Instant;

  constructor(timestamp: Temporal.Instant | string) {
    super("timerStopped");
    this.timestamp = Temporal.Instant.from(timestamp);
  }
}

export class IntervalElapsedEvent extends Event {
  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.DurationLike;

  constructor(
    timestamp: Temporal.Instant | string,
    interval: Temporal.DurationLike | string,
  ) {
    super("intervalElapsed");
    this.timestamp = Temporal.Instant.from(timestamp);
    this.interval = Temporal.Duration.from(interval);
  }
}
