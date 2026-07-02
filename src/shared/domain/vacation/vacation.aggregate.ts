// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type VacationState = Readonly<{
  date: Temporal.PlainDate;
  duration?: Temporal.Duration;
}>;

export function createVacation({
  date,
  duration,
}: {
  date: Temporal.PlainDateLike;
  duration?: Temporal.DurationLike;
}): VacationState {
  return {
    date: Temporal.PlainDate.from(date),
    duration: duration != null ? Temporal.Duration.from(duration) : undefined,
  };
}
