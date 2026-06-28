// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class BurnUpData {
  static create({
    date,
    throughput,
    cumulativeThroughput,
  }: {
    date: Temporal.PlainDateLike;
    throughput: number;
    cumulativeThroughput: number;
  }) {
    return new BurnUpData(date, throughput, cumulativeThroughput);
  }

  static createTestInstance({
    date = "2026-03-24",
    throughput = 1,
    cumulativeThroughput = 1,
  }: {
    date?: Temporal.PlainDateLike;
    throughput?: number;
    cumulativeThroughput?: number;
  } = {}) {
    return BurnUpData.create({ date, throughput, cumulativeThroughput });
  }

  readonly date;
  readonly throughput;
  readonly cumulativeThroughput;

  constructor(
    date: Temporal.PlainDateLike,
    throughput: number,
    cumulativeThroughput: number,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.throughput = throughput;
    this.cumulativeThroughput = cumulativeThroughput;
  }
}
