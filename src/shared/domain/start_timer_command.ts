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

  static createTestInstance({
    interval = "PT30M",
  }: {
    interval?: Temporal.DurationLike | string;
  } = {}) {
    return StartTimerCommand.create({ interval });
  }

  readonly interval: Temporal.Duration;

  private constructor(interval: Temporal.DurationLike | string) {
    this.interval = Temporal.Duration.from(interval);
  }
}
