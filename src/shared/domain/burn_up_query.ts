// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class BurnUpQuery {
  static create({
    from,
    to,
    categories,
    timeZone,
  }: {
    from: Temporal.PlainDateLike | string;
    to: Temporal.PlainDateLike | string;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }): BurnUpQuery {
    return new BurnUpQuery(from, to, categories, timeZone);
  }

  readonly from: Temporal.PlainDate;
  readonly to: Temporal.PlainDate;
  readonly categories?: string[];
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
    categories?: string[],
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.from = Temporal.PlainDate.from(from);
    this.to = Temporal.PlainDate.from(to);
    this.categories = categories;
    this.timeZone = timeZone;
  }
}

export class BurnUpQueryResult {
  static create({
    data = [],
    totalThroughput = 0,
    categories = [],
  }: {
    data?: BurnUpData[];
    totalThroughput?: number;
    categories?: string[];
  } = {}): BurnUpQueryResult {
    return new BurnUpQueryResult(data, totalThroughput, categories);
  }

  readonly data: BurnUpData[];
  readonly totalThroughput: number;
  readonly categories: string[];

  private constructor(
    data: BurnUpData[],
    totalThroughput: number,
    categories: string[],
  ) {
    this.data = data;
    this.totalThroughput = totalThroughput;
    this.categories = categories;
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
