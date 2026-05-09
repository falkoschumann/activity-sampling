// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export const TIMER_STARTED_EVENT = "timerStarted";

export class TimerStartedEvent extends Event {
  static create({
    timestamp,
    interval,
  }: {
    timestamp: Temporal.Instant | string;
    interval: Temporal.DurationLike | string;
  }) {
    return new TimerStartedEvent(timestamp, interval);
  }

  static createTestInstance({
    timestamp = "2026-03-29T14:52:00Z",
    interval = "PT30M",
  }: {
    timestamp?: Temporal.Instant | string;
    interval?: Temporal.DurationLike | string;
  } = {}) {
    return TimerStartedEvent.create({ timestamp, interval });
  }

  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.Duration;

  private constructor(
    timestamp: Temporal.Instant | string,
    interval: Temporal.DurationLike | string,
  ) {
    super(TIMER_STARTED_EVENT);
    this.timestamp = Temporal.Instant.from(timestamp);
    this.interval = Temporal.Duration.from(interval);
  }
}
