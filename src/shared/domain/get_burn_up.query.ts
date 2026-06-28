// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { BurnUpData } from "./burn_up_data";

export class GetBurnUpQuery {
  static create({
    from,
    to,
    categories = [],
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    from: Temporal.PlainDateLike;
    to: Temporal.PlainDateLike;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetBurnUpQuery(from, to, categories, timeZone);
  }

  static createTestInstance({
    from = "2026-03-23",
    to = "2026-03-29",
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    from?: Temporal.PlainDateLike;
    to?: Temporal.PlainDateLike;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetBurnUpQuery.create({ from, to, categories, timeZone });
  }

  readonly type = "get-burn-up";
  readonly data;

  private constructor(
    from: Temporal.PlainDateLike,
    to: Temporal.PlainDateLike,
    categories: string[],
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.data = {
      from: Temporal.PlainDate.from(from),
      to: Temporal.PlainDate.from(to),
      categories: categories,
      timeZone: timeZone,
    };
  }
}

export class GetBurnUpQueryResult {
  static create({
    data = [],
    totalThroughput = 0,
    categories = [],
  }: {
    data?: BurnUpData[];
    totalThroughput?: number;
    categories?: string[];
  } = {}) {
    return new GetBurnUpQueryResult(data, totalThroughput, categories);
  }

  static createTestInstance({
    data = [BurnUpData.createTestInstance()],
    totalThroughput = 1,
    categories = ["Feature"],
  }: {
    data?: BurnUpData[];
    totalThroughput?: number;
    categories?: string[];
  } = {}) {
    return GetBurnUpQueryResult.create({ data, totalThroughput, categories });
  }

  readonly data;
  readonly totalThroughput;
  readonly categories;

  private constructor(
    data: BurnUpData[],
    totalThroughput: number,
    categories: string[],
  ) {
    this.data = data.map(BurnUpData.create);
    this.totalThroughput = totalThroughput;
    this.categories = categories;
  }
}
