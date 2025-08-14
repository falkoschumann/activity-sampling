// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Clock {
  static create() {
    return new Clock(() => Temporal.Now.instant());
  }

  static createNull(
    fixed: Temporal.Instant | string = Temporal.Instant.fromEpochMilliseconds(
      0,
    ),
  ) {
    return new Clock(() => Temporal.Instant.from(fixed));
  }

  #now;

  private constructor(now: () => Temporal.Instant) {
    this.#now = now;
  }

  now(): Temporal.Instant {
    return this.#now();
  }

  setFixed(fixed: Temporal.Instant | string) {
    this.#now = () => Temporal.Instant.from(fixed);
  }
}
