// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface HolidayState {
  readonly date: Temporal.PlainDate;
  readonly title: string;
  readonly duration?: Temporal.Duration;
}

export function createHoliday({
  date,
  title,
  duration,
}: {
  date: Temporal.PlainDateLike;
  title: string;
  duration?: Temporal.DurationLike;
}): HolidayState {
  return {
    date: Temporal.PlainDate.from(date),
    title,
    duration: duration != null ? Temporal.Duration.from(duration) : undefined,
  };
}
