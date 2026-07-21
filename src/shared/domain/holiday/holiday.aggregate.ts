// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface HolidayState {
  readonly date: Temporal.PlainDateLike;
  readonly title: string;
  readonly duration?: Temporal.DurationLike;
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
    date: Temporal.PlainDate.from(date).toString(),
    title,
    duration:
      duration != null
        ? Temporal.Duration.from(duration).toString()
        : undefined,
  };
}
