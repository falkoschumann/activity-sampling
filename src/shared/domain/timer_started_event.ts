// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

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
