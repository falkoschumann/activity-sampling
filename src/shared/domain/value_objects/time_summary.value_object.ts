// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimeSummary {
  readonly today: Temporal.DurationLike;
  readonly yesterday: Temporal.DurationLike;
  readonly thisWeek: Temporal.DurationLike;
  readonly thisMonth: Temporal.DurationLike;
}

export function createTimeSummary({
  today = "PT0S",
  yesterday = "PT0S",
  thisWeek = "PT0S",
  thisMonth = "PT0S",
}: {
  today?: Temporal.DurationLike;
  yesterday?: Temporal.DurationLike;
  thisWeek?: Temporal.DurationLike;
  thisMonth?: Temporal.DurationLike;
} = {}): TimeSummary {
  return { today, yesterday, thisWeek, thisMonth };
}
