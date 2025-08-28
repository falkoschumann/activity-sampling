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

  static offset(
    baseClock: Clock,
    offsetDuration: Temporal.Duration | Temporal.DurationLike | string,
  ): Clock {
    return new OffsetClock(baseClock, Temporal.Duration.from(offsetDuration));
  }

  #instant: Temporal.Instant;
  #zone: Temporal.TimeZoneLike;

  protected constructor(
    instant: Temporal.Instant,
    zone: Temporal.TimeZoneLike,
  ) {
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
    return this.instant().epochMilliseconds;
  }
}

class OffsetClock extends Clock {
  #baseClock: Clock;
  #offsetDuration: Temporal.Duration;

  constructor(baseClock: Clock, offsetDuration: Temporal.Duration) {
    super(baseClock.instant().add(offsetDuration), baseClock.zone);
    this.#baseClock = baseClock;
    this.#offsetDuration = offsetDuration;
  }

  instant(): Temporal.Instant {
    return this.#baseClock.instant().add(this.#offsetDuration);
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

export const FormatStyle = Object.freeze({
  // Example: Samstag, 28. Juni 2025
  FULL: "full",
  // Example: 28. Juni 2025
  LONG: "long",
  // Examples: 28.06.2025, 12:02:38
  MEDIUM: "medium",
  // Examples: 28.06.25, 12:02
  SHORT: "short",
});

export type FormatStyle = (typeof FormatStyle)[keyof typeof FormatStyle];

export function formatDateTime(
  dateTime: Temporal.PlainDateTime | Temporal.PlainDateTimeLike | string,
  dateFormat: FormatStyle = FormatStyle.MEDIUM,
  timeFormat: FormatStyle = FormatStyle.MEDIUM,
): string {
  return Temporal.PlainDateTime.from(dateTime).toLocaleString(undefined, {
    dateStyle: dateFormat,
    timeStyle: timeFormat,
    hour12: false,
  });
}

export function formatDate(
  date: Temporal.PlainDate | Temporal.PlainDateLike | string,
  format: FormatStyle = FormatStyle.MEDIUM,
): string {
  return Temporal.PlainDate.from(date).toLocaleString(undefined, {
    dateStyle: format,
  });
}

export function formatTime(
  time: Temporal.PlainTime | Temporal.PlainTimeLike | string,
  format: FormatStyle = FormatStyle.MEDIUM,
): string {
  return Temporal.PlainTime.from(time).toLocaleString(undefined, {
    timeStyle: format,
    hour12: false,
  });
}

export function formatDuration(
  duration: Temporal.Duration | string,
  format: FormatStyle = FormatStyle.MEDIUM,
): string {
  const s = Temporal.Duration.from(duration).toLocaleString(undefined, {
    style: "digital",
    hours: "2-digit",
    minutes: "2-digit",
    seconds: "2-digit",
  });
  if (format === "medium") {
    return s.slice(0, -3);
  }
  return s;
}
