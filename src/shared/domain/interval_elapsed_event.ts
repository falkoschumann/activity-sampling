// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

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
