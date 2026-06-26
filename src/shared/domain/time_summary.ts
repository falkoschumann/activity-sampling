// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimeSummary {
  static create({
    today = "PT0S",
    yesterday = "PT0S",
    thisWeek = "PT0S",
    thisMonth = "PT0S",
  }: {
    today?: Temporal.DurationLike;
    yesterday?: Temporal.DurationLike;
    thisWeek?: Temporal.DurationLike;
    thisMonth?: Temporal.DurationLike;
  } = {}) {
    return new TimeSummary(today, yesterday, thisWeek, thisMonth);
  }

  static createTestInstance({
    today = "PT30M",
    yesterday = "PT0S",
    thisWeek = "PT30M",
    thisMonth = "PT30M",
  }: {
    today?: Temporal.DurationLike;
    yesterday?: Temporal.DurationLike;
    thisWeek?: Temporal.DurationLike;
    thisMonth?: Temporal.DurationLike;
  } = {}) {
    return new TimeSummary(today, yesterday, thisWeek, thisMonth);
  }

  readonly today: Temporal.Duration;
  readonly yesterday: Temporal.Duration;
  readonly thisWeek: Temporal.Duration;
  readonly thisMonth: Temporal.Duration;

  private constructor(
    today: Temporal.DurationLike,
    yesterday: Temporal.DurationLike,
    thisWeek: Temporal.DurationLike,
    thisMonth: Temporal.DurationLike,
  ) {
    this.today = Temporal.Duration.from(today);
    this.yesterday = Temporal.Duration.from(yesterday);
    this.thisWeek = Temporal.Duration.from(thisWeek);
    this.thisMonth = Temporal.Duration.from(thisMonth);
  }
}
