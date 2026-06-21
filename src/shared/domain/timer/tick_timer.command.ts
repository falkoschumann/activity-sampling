// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TickTimerCommand {
  static create({
    isElapsed = false,
    duration,
    progressedTime,
    timestamp,
  }: {
    isElapsed?: boolean;
    duration: Temporal.DurationLike;
    progressedTime?: Temporal.DurationLike;
    timestamp?: Temporal.InstantLike;
  }) {
    return new TickTimerCommand(isElapsed, duration, progressedTime, timestamp);
  }

  readonly type = "tick-timer";
  readonly data;

  private constructor(
    isElapsed: boolean,
    duration: Temporal.DurationLike,
    progressedTime?: Temporal.DurationLike,
    timestamp?: Temporal.InstantLike,
  ) {
    if (isElapsed) {
      if (timestamp == null) {
        throw new TypeError("Timestamp is required when timer is elapsed");
      }

      this.data = {
        isElapsed: isElapsed,
        duration: Temporal.Duration.from(duration),
        timestamp: Temporal.Instant.from(timestamp),
      };
    } else {
      if (progressedTime == null) {
        throw new TypeError(
          "Elapsed time is required when timer is not elapsed",
        );
      }

      this.data = {
        isElapsed: isElapsed,
        duration: Temporal.Duration.from(duration),
        progressedTime: Temporal.Duration.from(progressedTime),
      };
    }
  }
}
