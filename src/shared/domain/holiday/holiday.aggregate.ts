// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type HolidayState = Readonly<{
  date: Temporal.PlainDate;
  title: string;
  duration?: Temporal.Duration;
}>;

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
