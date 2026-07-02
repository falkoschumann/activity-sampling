// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimerStartedEvent {
  static create({
    timer = "default",
    interval,
  }: {
    timer?: string;
    interval: Temporal.DurationLike;
  }) {
    return new TimerStartedEvent(timer, interval);
  }

  readonly type = "timer-started";
  readonly data;

  private constructor(timer: string, interval: Temporal.DurationLike) {
    this.data = {
      timer,
      interval: Temporal.Duration.from(interval),
    };
  }
}
