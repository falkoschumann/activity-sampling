// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimerElapsedEvent {
  static create({
    timer = "default",
    timestamp,
    duration,
  }: {
    timer?: string;
    timestamp: Temporal.InstantLike;
    duration: Temporal.DurationLike;
  }) {
    return new TimerElapsedEvent(timer, timestamp, duration);
  }

  readonly type = "timer-elapsed";
  readonly data;

  private constructor(
    timer: string,
    timestamp: Temporal.InstantLike,
    duration: Temporal.DurationLike,
  ) {
    this.data = {
      timer,
      timestamp: Temporal.Instant.from(timestamp),
      duration: Temporal.Duration.from(duration),
    };
  }
}
