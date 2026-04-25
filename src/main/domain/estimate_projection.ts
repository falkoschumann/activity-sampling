// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { ActivitiesProjection, Activity } from "./activities_projection";
import type { ActivityLoggedEvent } from "./activity_logged_event";
import { CategoriesProjection } from "./categories_projection";
import type { Projection } from "./projection";

export class EstimateProjection implements Projection<EstimateQueryResult> {
  static create({
    query,
    timeZone,
  }: {
    query: EstimateQuery;
    timeZone: Temporal.TimeZoneLike;
  }) {
    return new EstimateProjection(query, timeZone);
  }

  readonly #activitiesProjection;
  readonly #categoriesProjection;

  private constructor(query: EstimateQuery, timeZone: Temporal.TimeZoneLike) {
    this.#activitiesProjection = ActivitiesProjection.create({
      categories: query.categories,
      timeZone,
    });
    this.#categoriesProjection = CategoriesProjection.create();
  }

  update(event: ActivityLoggedEvent) {
    this.#activitiesProjection.update(event);
    this.#categoriesProjection.update(event);
  }

  get(): EstimateQueryResult {
    const activities = this.#activitiesProjection.get();
    const cycleTimes = determineCycleTimes(activities);
    return EstimateQueryResult.create({
      cycleTimes,
      categories: this.#categoriesProjection.get(),
      totalCount: activities.length,
    });
  }
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
