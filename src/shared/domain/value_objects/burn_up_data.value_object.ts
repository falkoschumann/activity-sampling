// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface BurnUpData {
  readonly date: Temporal.PlainDateLike;
  readonly throughput: number;
  readonly cumulativeThroughput: number;
}

export function createBurnUpData({
  date,
  throughput,
  cumulativeThroughput,
}: {
  date: Temporal.PlainDateLike;
  throughput: number;
  cumulativeThroughput: number;
}): BurnUpData {
  return { date, throughput, cumulativeThroughput };
}
