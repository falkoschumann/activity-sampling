// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

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
  "days" | "hours" | "minutes" | "seconds" | "milliseconds";
