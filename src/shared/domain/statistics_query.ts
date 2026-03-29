// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class StatisticsQuery {
  static create({
    scope,
    categories,
    timeZone,
  }: {
    scope: StatisticsScope;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }): StatisticsQuery {
    return new StatisticsQuery(scope, categories, timeZone);
  }

  static createTestInstance({
    scope = StatisticsScope.CYCLE_TIMES,
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    scope?: StatisticsScope;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}): StatisticsQuery {
    return StatisticsQuery.create({ scope, categories, timeZone });
  }

  readonly scope: StatisticsScope;
  readonly categories?: string[];
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(
    scope: StatisticsScope,
    categories?: string[],
    timeZone?: Temporal.TimeZoneLike,
  ) {
    this.scope = scope;
    this.categories = categories;
    this.timeZone = timeZone;
  }
}

export const StatisticsScope = Object.freeze({
  WORKING_HOURS: "Working hours",
  CYCLE_TIMES: "Cycle times",
});

export type StatisticsScope =
  (typeof StatisticsScope)[keyof typeof StatisticsScope];

export class StatisticsQueryResult {
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
  } = {}): StatisticsQueryResult {
    return new StatisticsQueryResult(
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
  } = {}): StatisticsQueryResult {
    return StatisticsQueryResult.create({
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

export class Histogram {
  static create({
    binEdges = [],
    frequencies = [],
    xAxisLabel = "",
    yAxisLabel = "",
  }: {
    binEdges?: string[];
    frequencies?: number[];
    xAxisLabel?: string;
    yAxisLabel?: string;
  } = {}) {
    return new Histogram(binEdges, frequencies, xAxisLabel, yAxisLabel);
  }

  static createTestInstance({
    binEdges = ["0", "0.5", "1", "2", "3", "5"],
    frequencies = [0, 1, 0, 0, 0],
    xAxisLabel = "Cycle times (days)",
    yAxisLabel = "Number of tasks",
  }: {
    binEdges?: string[];
    frequencies?: number[];
    xAxisLabel?: string;
    yAxisLabel?: string;
  } = {}) {
    return Histogram.create({ binEdges, frequencies, xAxisLabel, yAxisLabel });
  }

  readonly binEdges: string[];
  readonly frequencies: number[];
  readonly xAxisLabel: string;
  readonly yAxisLabel: string;

  private constructor(
    binEdges: string[],
    frequencies: number[],
    xAxisLabel: string,
    yAxisLabel: string,
  ) {
    this.binEdges = binEdges;
    this.frequencies = frequencies;
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
  }
}

export class Median {
  static create({
    edge0 = 0,
    edge25 = 0,
    edge50 = 0,
    edge75 = 0,
    edge100 = 0,
  }: {
    edge0?: number;
    edge25?: number;
    edge50?: number;
    edge75?: number;
    edge100?: number;
  } = {}) {
    return new Median(edge0, edge25, edge50, edge75, edge100);
  }

  static createTestInstance({
    edge0 = 0,
    edge25 = 0,
    edge50 = 1,
    edge75 = 0,
    edge100 = 0,
  }: {
    edge0?: number;
    edge25?: number;
    edge50?: number;
    edge75?: number;
    edge100?: number;
  } = {}) {
    return Median.create({ edge0, edge25, edge50, edge75, edge100 });
  }

  readonly edge0: number;
  readonly edge25: number;
  readonly edge50: number;
  readonly edge75: number;
  readonly edge100: number;

  private constructor(
    edge0: number,
    edge25: number,
    edge50: number,
    edge75: number,
    edge100: number,
  ) {
    this.edge0 = edge0;
    this.edge25 = edge25;
    this.edge50 = edge50;
    this.edge75 = edge75;
    this.edge100 = edge100;
  }
}
