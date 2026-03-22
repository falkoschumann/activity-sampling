// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class TimerState {
  static create({
    intervalId,
    currentInterval,
  }: {
    intervalId?: ReturnType<typeof globalThis.setInterval>;
    currentInterval?: Temporal.DurationLike | string;
  } = {}) {
    return new TimerState(intervalId, currentInterval);
  }

  intervalId?: ReturnType<typeof globalThis.setInterval>;
  currentInterval?: Temporal.DurationLike;

  private constructor(
    intervalId?: ReturnType<typeof globalThis.setInterval>,
    currentInterval?: Temporal.DurationLike | string,
  ) {
    this.intervalId = intervalId;
    this.currentInterval =
      currentInterval != null
        ? Temporal.Duration.from(currentInterval)
        : undefined;
  }
}
