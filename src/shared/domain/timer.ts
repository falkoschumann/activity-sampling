// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class StartTimerCommand {
  static create({
    interval,
  }: {
    interval: Temporal.DurationLike | string;
  }): StartTimerCommand {
    return new StartTimerCommand(interval);
  }

  readonly interval: Temporal.Duration;

  private constructor(interval: Temporal.DurationLike | string) {
    this.interval = Temporal.Duration.from(interval);
  }
}

export class StopTimerCommand {
  static create(): StopTimerCommand {
    return new StopTimerCommand();
  }
}

export class CurrentIntervalQuery {
  static create(): CurrentIntervalQuery {
    return new CurrentIntervalQuery();
  }
}

export class CurrentIntervalQueryResult {
  static create({
    timestamp,
    duration,
  }: {
    timestamp: Temporal.Instant | string;
    duration: Temporal.DurationLike | string;
  }): CurrentIntervalQueryResult {
    return new CurrentIntervalQueryResult(timestamp, duration);
  }

  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;

  private constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
  ) {
    this.timestamp = Temporal.Instant.from(timestamp);
    this.duration = Temporal.Duration.from(duration);
  }
}

export interface TimerStartedEventInit {
  readonly timestamp: Temporal.Instant | string;
  readonly interval: Temporal.DurationLike | string;
}

export class TimerStartedEvent extends Event {
  static create(eventInitDict: TimerStartedEventInit): TimerStartedEvent {
    return new TimerStartedEvent(TimerStartedEvent.TYPE, eventInitDict);
  }

  static readonly TYPE = "timerStarted";

  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.Duration;

  private constructor(type: string, eventInitDict: TimerStartedEventInit) {
    super(type);
    this.timestamp = Temporal.Instant.from(eventInitDict.timestamp);
    this.interval = Temporal.Duration.from(eventInitDict.interval);
  }
}

export interface TimerStoppedEventInit {
  readonly timestamp: Temporal.Instant | string;
}

export class TimerStoppedEvent extends Event {
  static create(eventInitDict: TimerStoppedEventInit): TimerStoppedEvent {
    return new TimerStoppedEvent(TimerStoppedEvent.TYPE, eventInitDict);
  }

  static readonly TYPE = "timerStopped";

  readonly timestamp: Temporal.Instant;

  private constructor(type: string, eventInitDict: TimerStoppedEventInit) {
    super(type);
    this.timestamp = Temporal.Instant.from(eventInitDict.timestamp);
  }
}

export interface IntervalElapsedEventInit {
  readonly timestamp: Temporal.Instant | string;
  readonly interval: Temporal.DurationLike | string;
}

export class IntervalElapsedEvent extends Event {
  static create(eventInitDict: IntervalElapsedEventInit): IntervalElapsedEvent {
    return new IntervalElapsedEvent(IntervalElapsedEvent.TYPE, eventInitDict);
  }

  static readonly TYPE = "intervalElapsed";

  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.Duration;

  private constructor(type: string, eventInitDict: IntervalElapsedEventInit) {
    super(type);
    this.timestamp = Temporal.Instant.from(eventInitDict.timestamp);
    this.interval = Temporal.Duration.from(eventInitDict.interval);
  }
}
