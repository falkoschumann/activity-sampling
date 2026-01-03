// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class BurnUpQuery {
  static create({
    from,
    to,
    timeZone,
  }: {
    from: Temporal.PlainDateLike | string;
    to: Temporal.PlainDateLike | string;
    timeZone?: Temporal.TimeZoneLike;
  }): BurnUpQuery {
    return new BurnUpQuery(from, to, timeZone);
  }

  readonly from: Temporal.PlainDate;
  readonly to: Temporal.PlainDate;
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.from = Temporal.PlainDate.from(from);
    this.to = Temporal.PlainDate.from(to);
    this.timeZone = timeZone;
  }
}

export class BurnUpQueryResult {
  static create({
    data = [],
    totalThroughput = 0,
  }: {
    data?: BurnUpData[];
    totalThroughput?: number;
  } = {}): BurnUpQueryResult {
    return new BurnUpQueryResult(data, totalThroughput);
  }

  readonly data: BurnUpData[];
  readonly totalThroughput: number;

  private constructor(data: BurnUpData[], totalThroughput: number) {
    this.data = data;
    this.totalThroughput = totalThroughput;
  }
}

export class BurnUpData {
  static create({
    date,
    throughput,
    cumulativeThroughput,
  }: {
    date: Temporal.PlainDate | string;
    throughput: number;
    cumulativeThroughput: number;
  }): BurnUpData {
    return new BurnUpData(date, throughput, cumulativeThroughput);
  }

  readonly date: Temporal.PlainDate;
  readonly throughput: number;
  readonly cumulativeThroughput: number;

  constructor(
    date: Temporal.PlainDate | string,
    throughput: number,
    cumulativeThroughput: number,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.throughput = throughput;
    this.cumulativeThroughput = cumulativeThroughput;
  }
}
