// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Clock {
  static systemUtc() {
    return Clock.system("UTC");
  }

  static systemDefaultZone() {
    return Clock.system(Temporal.Now.timeZoneId());
  }

  static system(zone: Temporal.TimeZoneLike) {
    return new Clock(() => Temporal.Now.instant(), zone);
  }

  static fixed(
    fixedInstant: Temporal.InstantLike,
    zone: Temporal.TimeZoneLike,
  ) {
    return new Clock(() => Temporal.Instant.from(fixedInstant), zone);
  }

  static offset(
    baseClock: Clock,
    offsetDuration: Temporal.DurationLike,
  ): Clock {
    return new OffsetClock(baseClock, Temporal.Duration.from(offsetDuration));
  }

  readonly #instantFactory: () => Temporal.Instant;
  readonly #zone: Temporal.TimeZoneLike;

  protected constructor(
    instantFactory: () => Temporal.Instant,
    zone: Temporal.TimeZoneLike,
  ) {
    this.#instantFactory = instantFactory;
    this.#zone = zone;
  }

  get zone(): Temporal.TimeZoneLike {
    return this.#zone;
  }

  instant(): Temporal.Instant {
    return this.#instantFactory();
  }

  millis(): number {
    return this.instant().epochMilliseconds;
  }
}

class OffsetClock extends Clock {
  constructor(baseClock: Clock, offsetDuration: Temporal.Duration) {
    super(() => baseClock.instant().add(offsetDuration), baseClock.zone);
  }
}

export function isTimestampInPeriod({
  timestamp,
  timeZone,
  from,
  to,
}: {
  timestamp: Temporal.InstantLike;
  timeZone: Temporal.TimeZoneLike;
  from?: Temporal.PlainDateLike;
  to?: Temporal.PlainDateLike;
}) {
  timestamp = Temporal.Instant.from(timestamp);
  const date = timestamp.toZonedDateTimeISO(timeZone).toPlainDate();
  return isDateInPeriod({ date, from, to });
}

export function isDateInPeriod({
  date,
  from,
  to,
}: {
  date: Temporal.PlainDateLike;
  from?: Temporal.PlainDateLike;
  to?: Temporal.PlainDateLike;
}) {
  return (
    (from == null || Temporal.PlainDate.compare(date, from) >= 0) &&
    (to == null || Temporal.PlainDate.compare(date, to) <= 0)
  );
}

export function normalizeDuration(
  duration: Temporal.DurationLike,
  {
    smallestUnit = "milliseconds",
    largestUnit = "hours",
  }: {
    smallestUnit?: DurationType;
    largestUnit?: DurationType;
  } = {},
): Temporal.Duration {
  return Temporal.Duration.from(duration).round({
    smallestUnit,
    largestUnit,
  });
}

export type DurationType =
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

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
  dateTime: Temporal.PlainDateTimeLike,
  {
    dateFormat = FormatStyle.MEDIUM,
    timeFormat = FormatStyle.MEDIUM,
  }: { dateFormat?: FormatStyle; timeFormat?: FormatStyle } = {},
): string {
  return Temporal.PlainDateTime.from(dateTime).toLocaleString(undefined, {
    dateStyle: dateFormat,
    timeStyle: timeFormat,
    hour12: false,
  });
}

export function formatDate(
  date: Temporal.PlainDateLike,
  { format = FormatStyle.MEDIUM }: { format?: FormatStyle } = {},
): string {
  return Temporal.PlainDate.from(date).toLocaleString(undefined, {
    dateStyle: format,
  });
}

export function formatTime(
  time: Temporal.PlainTimeLike,
  { format = FormatStyle.MEDIUM }: { format?: FormatStyle } = {},
): string {
  return Temporal.PlainTime.from(time).toLocaleString(undefined, {
    timeStyle: format,
    hour12: false,
  });
}

export function formatDuration(
  duration: Temporal.DurationLike,
  { format = FormatStyle.MEDIUM }: { format?: FormatStyle } = {},
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
