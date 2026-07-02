// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimerTickedEvent {
  static create({
    timer = "default",
    progressedTime,
    duration,
  }: {
    timer?: string;
    progressedTime: Temporal.DurationLike;
    duration: Temporal.DurationLike;
  }) {
    return new TimerTickedEvent(timer, progressedTime, duration);
  }

  readonly type = "timer-ticked";
  readonly data;

  private constructor(
    timer: string,
    progressedTime: Temporal.DurationLike,
    duration: Temporal.DurationLike,
  ) {
    this.data = {
      timer,
      progressedTime: Temporal.Duration.from(progressedTime),
      duration: Temporal.Duration.from(duration),
    };
  }
}
