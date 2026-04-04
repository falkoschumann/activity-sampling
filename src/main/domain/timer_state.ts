// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class TimerState {
  static create({
    currentInterval,
  }: {
    currentInterval?: Temporal.DurationLike | string;
  } = {}) {
    return new TimerState(currentInterval);
  }

  currentInterval?: Temporal.DurationLike;

  private constructor(currentInterval?: Temporal.DurationLike | string) {
    this.currentInterval =
      currentInterval != null
        ? Temporal.Duration.from(currentInterval)
        : undefined;
  }
}
