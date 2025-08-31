// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class StartTimerCommand {
  readonly interval: Temporal.Duration;

  constructor(interval: Temporal.DurationLike | string) {
    this.interval = Temporal.Duration.from(interval);
  }
}

export class StopTimerCommand {}

export class CurrentIntervalQuery {}

export class CurrentIntervalQueryResult {
  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;

  constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
  ) {
    this.timestamp = Temporal.Instant.from(timestamp);
    this.duration = Temporal.Duration.from(duration);
  }
}

export class TimerStartedEvent extends Event {
  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.Duration;

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
  readonly interval: Temporal.Duration;

  constructor(
    timestamp: Temporal.Instant | string,
    interval: Temporal.DurationLike | string,
  ) {
    super("intervalElapsed");
    this.timestamp = Temporal.Instant.from(timestamp);
    this.interval = Temporal.Duration.from(interval);
  }
}
