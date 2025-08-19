// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Clock {
  static systemUtc() {
    return Clock.system("UTC");
  }

  static systemDefaultZone() {
    return Clock.system(Temporal.Now.timeZoneId());
  }

  static system(zone: Temporal.TimeZoneLike) {
    return new Clock(Temporal.Now.instant(), zone);
  }

  static fixed(
    fixedInstant: Temporal.Instant | string,
    zone: Temporal.TimeZoneLike,
  ) {
    return new Clock(Temporal.Instant.from(fixedInstant), zone);
  }

  #instant: Temporal.Instant;
  #zone: Temporal.TimeZoneLike;

  private constructor(instant: Temporal.Instant, zone: Temporal.TimeZoneLike) {
    this.#instant = instant;
    this.#zone = zone;
  }

  get zone(): Temporal.TimeZoneLike {
    return this.#zone;
  }

  instant(): Temporal.Instant {
    return this.#instant;
  }

  millis(): number {
    return this.#instant.epochMilliseconds;
  }
}

export function normalizeDuration(
  duration: Temporal.Duration,
): Temporal.Duration {
  return duration.round({
    largestUnit: "hours",
    smallestUnit: "nanoseconds",
  });
}
