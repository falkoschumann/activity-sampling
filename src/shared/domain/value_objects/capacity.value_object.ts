// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface Capacity {
  readonly hours: Temporal.DurationLike;
  readonly offset: Temporal.DurationLike;
}

export function createCapacity({
  hours = "PT40H",
  offset = "-PT40H",
}: {
  hours?: Temporal.DurationLike;
  offset?: Temporal.DurationLike;
} = {}): Capacity {
  return { hours, offset };
}
