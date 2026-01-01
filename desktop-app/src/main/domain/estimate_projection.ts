// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  ActivityLoggedEvent,
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/activities";
import {
  ActivitiesProjection,
  Activity,
  CategoriesProjection,
} from "./activities";

export async function projectEstimate(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: EstimateQuery,
): Promise<EstimateQueryResult> {
  const activitiesProjection = new ActivitiesProjection(query.categories);
  const categoriesProjection = new CategoriesProjection();
  for await (const event of replay) {
    activitiesProjection.update(event);
    categoriesProjection.update(event);
  }
  const activities = activitiesProjection.get();
  const cycleTimes = determineCycleTimes(activities);
  return EstimateQueryResult.create({
    cycleTimes,
    categories: categoriesProjection.get(),
    totalCount: activities.length,
  });
}

function determineCycleTimes(activities: Activity[]) {
  const cycleTimeCounts = new Map<number, number>();
  for (const activity of activities) {
    const cycleTimeDays =
      activity.finish.since(activity.start).total("days") + 1;
    const frequency = cycleTimeCounts.get(cycleTimeDays) ?? 0;
    cycleTimeCounts.set(cycleTimeDays, frequency + 1);
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
