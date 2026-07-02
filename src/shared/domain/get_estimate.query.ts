// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type ActivityState,
  mergeCategories,
} from "./activity/activity.aggregate";
import type { ReportView } from "./report.read_model";
import { EstimateEntry } from "./estimate_entry";

export class GetEstimateQuery {
  static create({
    categories = [],
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetEstimateQuery(categories, timeZone);
  }

  static createTestInstance({
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetEstimateQuery.create({ categories, timeZone });
  }

  readonly type = "get-estimate";
  readonly data;

  private constructor(categories: string[], timeZone: Temporal.TimeZoneLike) {
    this.data = {
      categories,
      timeZone,
    };
  }
}

export class GetEstimateQueryResult {
  static create({
    cycleTimes = [],
    categories = [],
    totalCount = 0,
  }: {
    cycleTimes?: EstimateEntry[];
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return new GetEstimateQueryResult(cycleTimes, categories, totalCount);
  }

  static createTestInstance({
    cycleTimes = [EstimateEntry.createTestInstance()],
    categories = ["Feature"],
    totalCount = 1,
  }: {
    cycleTimes?: EstimateEntry[];
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return GetEstimateQueryResult.create({
      cycleTimes,
      categories,
      totalCount,
    });
  }

  readonly cycleTimes;
  readonly categories;
  readonly totalCount;

  private constructor(
    cycleTimes: EstimateEntry[],
    categories: string[],
    totalCount: number,
  ) {
    this.cycleTimes = cycleTimes.map(EstimateEntry.create);
    this.categories = categories;
    this.totalCount = totalCount;
  }
}

export function getEstimate(
  view: ReportView,
  query: GetEstimateQuery,
): GetEstimateQueryResult {
  const activities = mergeCategories(view.activities, query.data.categories);
  const cycleTimes = determineCycleTimes(activities);
  return GetEstimateQueryResult.create({
    cycleTimes,
    categories: view.categories,
    totalCount: activities.length,
  });
}

function determineCycleTimes(activities: ActivityState[]) {
  const cycleTimeCounts = new Map<number, number>();
  for (const activity of activities) {
    const cycleTime = activity.finish.since(activity.start).total("days") + 1;
    const frequency = cycleTimeCounts.get(cycleTime) ?? 0;
    cycleTimeCounts.set(cycleTime, frequency + 1);
  }

  const sortedCycleTimes = Array.from(cycleTimeCounts.entries()).sort(
    (a, b) => a[0] - b[0],
  );
  const totalFrequencies = Array.from(cycleTimeCounts.values()).reduce(
    (sum, freq) => sum + freq,
    0,
  );
  let cumulativeProbability = 0;
  return sortedCycleTimes.map(([cycleTime, frequency]) => {
    const probability = frequency / totalFrequencies;
    cumulativeProbability += probability;
    return EstimateEntry.create({
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    });
  });
}
