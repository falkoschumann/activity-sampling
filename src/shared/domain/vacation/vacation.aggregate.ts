// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface VacationState {
  readonly date: Temporal.PlainDateLike;
  readonly duration?: Temporal.DurationLike;
}

export function createVacation({
  date,
  duration,
}: {
  date: Temporal.PlainDateLike;
  duration?: Temporal.DurationLike;
}): VacationState {
  return {
    date: Temporal.PlainDate.from(date).toString(),
    duration:
      duration != null
        ? Temporal.Duration.from(duration).toString()
        : undefined,
  };
}
