// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ReportView } from "./report.read_model";
import {
  GetEstimateQuery,
  GetEstimateQueryResult,
} from "../../shared/domain/get_estimate.query";
import { EstimateEntry } from "../../shared/domain/estimate_entry";
import {
  type ActivityState,
  mergeCategories,
} from "./logged-activity/activity.aggregate";

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
