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
  static readonly TYPE = "timerStarted";

  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.Duration;

  constructor(
    timestamp: Temporal.Instant | string,
    interval: Temporal.DurationLike | string,
  ) {
    super(TimerStartedEvent.TYPE);
    this.timestamp = Temporal.Instant.from(timestamp);
    this.interval = Temporal.Duration.from(interval);
  }
}

export class TimerStoppedEvent extends Event {
  static readonly TYPE = "timerStopped";

  readonly timestamp: Temporal.Instant;

  constructor(timestamp: Temporal.Instant | string) {
    super(TimerStoppedEvent.TYPE);
    this.timestamp = Temporal.Instant.from(timestamp);
  }
}

export class IntervalElapsedEvent extends Event {
  static readonly TYPE = "intervalElapsed";

  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.Duration;

  constructor(
    timestamp: Temporal.Instant | string,
    interval: Temporal.DurationLike | string,
  ) {
    super(IntervalElapsedEvent.TYPE);
    this.timestamp = Temporal.Instant.from(timestamp);
    this.interval = Temporal.Duration.from(interval);
  }
}
