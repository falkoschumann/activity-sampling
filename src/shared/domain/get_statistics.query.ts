// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type ActivityState,
  mergeCategories,
} from "./activity/activity.aggregate";
import type { ReportView } from "./report.read_model";
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

export function getStatistics(
  view: ReportView,
  query: GetStatisticsQuery,
): GetStatisticsQueryResult {
  const activities = mergeCategories(view.activities, query.data.categories);
  const statistics = createDays(activities, query);
  const histogram = createHistogram(
    statistics.xAxisLabel,
    statistics.days,
    query.data.scope,
  );
  const median = createMedian(statistics.days);
  return GetStatisticsQueryResult.create({
    histogram,
    median,
    categories: view.categories,
    totalCount: statistics.totalCount,
  });
}

function createDays(activities: ActivityState[], query: GetStatisticsQuery) {
  switch (query.data.scope) {
    case StatisticsScope.WORKING_HOURS:
      return createWorkingHoursStatistics(activities);
    case StatisticsScope.CYCLE_TIMES:
      return createCycleTimesStatistics(activities);
  }
}

function createWorkingHoursStatistics(activities: ActivityState[]) {
  let totalCount = 0;
  let days: number[] = [];
  for (const activity of activities) {
    totalCount++;
    const workDays = activity.hours.total("hours") / 8;
    days.push(workDays);
  }
  days = Object.values(days).sort((a, b) => a - b);
  return { xAxisLabel: "Duration (days)", days, totalCount };
}

function createCycleTimesStatistics(activities: ActivityState[]) {
  let totalCount = 0;
  let days: number[] = [];
  for (const activity of activities) {
    totalCount++;
    const cycleTime = activity.finish.since(activity.start).total("days") + 1;
    days.push(cycleTime);
  }
  days = Object.values(days).sort((a, b) => a - b);
  return { xAxisLabel: "Cycle time (days)", days, totalCount };
}

function createHistogram(
  xAxisLabel: string,
  days: number[],
  scope: StatisticsScope,
) {
  const maxDay = days.at(-1) ?? 0;
  const binEdges: number[] = [];
  const frequencies: number[] = [];
  let i = 0;
  while (i < Math.ceil(maxDay)) {
    if (i === 0) {
      binEdges.push(0);
      frequencies.push(0);
      if (scope === StatisticsScope.WORKING_HOURS) {
        binEdges.push(0.5);
        frequencies.push(0);
      }
      binEdges.push(1);
      frequencies.push(0);
      binEdges.push(2);
      i = 2;
    } else {
      i = binEdges.at(-2)! + binEdges.at(-1)!;
      frequencies.push(0);
      binEdges.push(i);
    }
  }

  for (const day of days) {
    for (let i = 0; i < binEdges.length - 1; i++) {
      if (binEdges[i]! < day && day <= binEdges[i + 1]!) {
        frequencies[i]!++;
        break;
      }
    }
  }

  return {
    binEdges: binEdges.map((edge) => String(edge)),
    frequencies,
    xAxisLabel,
    yAxisLabel: "Number of Tasks",
  };
}

function createMedian(days: number[]) {
  const maxDay = days.at(-1) ?? 0;
  const edge0 = 0;
  let edge25 = 0;
  let edge50 = 0;
  let edge75 = 0;
  let edge100 = 0;
  if (days.length > 0) {
    const i25 = Math.max(0, days.length * 0.25 - 1);
    if (Number.isInteger(i25)) {
      edge25 = days[i25]!;
    } else {
      edge25 = (days[Math.floor(i25)]! + days[Math.ceil(i25)]!) / 2;
    }
    edge25 = Math.round(edge25 * 10) / 10;

    if (days.length % 2 === 0) {
      edge50 = (days[days.length / 2 - 1]! + days[days.length / 2]!) / 2;
    } else {
      edge50 = days[Math.floor(days.length / 2)]!;
    }
    edge50 = Math.round(edge50 * 10) / 10;

    const i75 = days.length * 0.75 - 1;
    if (Number.isInteger(i75)) {
      edge75 = days[i75]!;
    } else {
      edge75 = (days[Math.floor(i75)]! + days[Math.ceil(i75)]!) / 2;
    }
    edge75 = Math.round(edge75 * 10) / 10;

    edge100 = maxDay;
  }

  return { edge0, edge25, edge50, edge75, edge100 };
}
