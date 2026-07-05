// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

// TODO make functional

import {
  type Activity,
  selectDistinctCategories,
} from "./activity.value_object";
import type { ReportView } from "./report.read_model";
import {
  createEstimateEntry,
  type EstimateEntry,
} from "./estimate_entry.value_object";

export interface GetEstimateQuery {
  readonly type: "get-estimate";
  readonly data: GetEstimateQueryData;
}

export type GetEstimateQueryData = Readonly<{
  categories: string[];
  timeZone: Temporal.TimeZoneLike;
}>;

export function createGetEstimateQuery({
  categories = [],
  timeZone = Temporal.Now.timeZoneId(),
}: {
  categories?: string[];
  timeZone?: Temporal.TimeZoneLike;
}): GetEstimateQuery {
  return {
    type: "get-estimate",
    data: { categories, timeZone },
  };
}

export interface GetEstimateQueryResult {
  readonly cycleTimes: EstimateEntry[];
  readonly categories: string[];
  readonly totalCount: number;
}

export function createGetEstimateQueryResult({
  cycleTimes = [],
  categories = [],
  totalCount = 0,
}: {
  cycleTimes?: EstimateEntry[];
  categories?: string[];
  totalCount?: number;
} = {}): GetEstimateQueryResult {
  return { cycleTimes, categories, totalCount };
}

export function getEstimate(
  view: ReportView,
  query: GetEstimateQuery,
): GetEstimateQueryResult {
  const activities = selectDistinctCategories(
    view.activities,
    query.data.categories,
  );
  const cycleTimes = determineCycleTimes(activities);
  return createGetEstimateQueryResult({
    cycleTimes,
    categories: view.categories,
    totalCount: activities.length,
  });
}

function determineCycleTimes(activities: Activity[]) {
  const cycleTimeCounts = new Map<number, number>();
  for (const activity of activities) {
    const cycleTime =
      Temporal.PlainDate.from(activity.finish)
        .since(activity.start)
        .total("days") + 1;
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
    return createEstimateEntry({
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    });
  });
}
