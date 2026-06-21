// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class StartTimerCommand {
  static create({ interval }: { interval: Temporal.DurationLike }) {
    return new StartTimerCommand(interval);
  }

  readonly type = "start-timer";
  readonly data;

  private constructor(interval: Temporal.DurationLike) {
    this.data = {
      interval: Temporal.Duration.from(interval),
    };
  }
}
