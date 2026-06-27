// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Capacity {
  static create({
    hours = "PT40H",
    offset = "-PT40H",
  }: {
    hours?: Temporal.DurationLike;
    offset?: Temporal.DurationLike;
  } = {}) {
    return new Capacity(hours, offset);
  }

  static createTestInstance({
    hours = "PT2H",
    offset = "-PT38H",
  }: {
    hours?: Temporal.DurationLike;
    offset?: Temporal.DurationLike;
  } = {}) {
    return Capacity.create({ hours, offset });
  }

  readonly hours;
  readonly offset;

  private constructor(
    hours: Temporal.DurationLike,
    offset: Temporal.DurationLike,
  ) {
    this.hours = Temporal.Duration.from(hours);
    this.offset = Temporal.Duration.from(offset);
  }
}
