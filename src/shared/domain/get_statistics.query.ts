// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Histogram } from "./histogram";
import { Median } from "./median";

export class GetStatisticsQuery {
  static create({
    scope,
    categories = [],
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    scope: StatisticsScope;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetStatisticsQuery(scope, categories, timeZone);
  }

  static createTestInstance({
    scope = StatisticsScope.CYCLE_TIMES,
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    scope?: StatisticsScope;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetStatisticsQuery.create({ scope, categories, timeZone });
  }

  readonly type = "get-statistics";
  readonly data;

  private constructor(
    scope: StatisticsScope,
    categories: string[],
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.data = {
      scope,
      categories,
      timeZone,
    };
  }
}

export const StatisticsScope = Object.freeze({
  WORKING_HOURS: "Working hours",
  CYCLE_TIMES: "Cycle times",
});

export type StatisticsScope =
  (typeof StatisticsScope)[keyof typeof StatisticsScope];

export class GetStatisticsQueryResult {
  static create({
    histogram = Histogram.create(),
    median = Median.create(),
    categories = [],
    totalCount = 0,
  }: {
    histogram?: Histogram;
    median?: Median;
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return new GetStatisticsQueryResult(
      Histogram.create(histogram),
      Median.create(median),
      categories,
      totalCount,
    );
  }

  static createTestInstance({
    histogram = Histogram.createTestInstance(),
    median = Median.createTestInstance(),
    categories = ["Feature"],
    totalCount = 1,
  }: {
    histogram?: Histogram;
    median?: Median;
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return GetStatisticsQueryResult.create({
      histogram,
      median,
      categories,
      totalCount,
    });
  }

  readonly histogram: Histogram;
  readonly median: Median;
  readonly categories: string[];
  readonly totalCount: number;

  private constructor(
    histogram: Histogram,
    median: Median,
    categories: string[],
    totalCount: number,
  ) {
    this.histogram = Histogram.create(histogram);
    this.median = Median.create(median);
    this.categories = categories;
    this.totalCount = totalCount;
  }
}
