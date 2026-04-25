// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  StatisticsQuery,
  StatisticsQueryResult,
  StatisticsScope,
} from "../../shared/domain/statistics_query";
import { ActivitiesProjection, Activity } from "./activities_projection";
import type { ActivityLoggedEvent } from "./activity_logged_event";
import { CategoriesProjection } from "./categories_projection";
import type { Projection } from "./projection";

export class StatisticsProjection implements Projection<StatisticsQueryResult> {
  static create({
    query,
    timeZone,
  }: {
    query: StatisticsQuery;
    timeZone: Temporal.TimeZoneLike;
  }) {
    return new StatisticsProjection(query, timeZone);
  }

  readonly #query;
  readonly #activitiesProjection;
  readonly #categoriesProjection;

  private constructor(query: StatisticsQuery, timeZone: Temporal.TimeZoneLike) {
    this.#query = query;
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

  get() {
    const activities = this.#activitiesProjection.get();

    let result;
    switch (this.#query.scope) {
      case StatisticsScope.WORKING_HOURS:
        result = createWorkingHoursStatistics(activities);
        break;
      case StatisticsScope.CYCLE_TIMES:
        result = createCycleTimesStatistics(activities);
        break;
    }

    const histogram = createHistogram(
      result.xAxisLabel,
      result.days,
      this.#query.scope,
    );
    const median = createMedian(result.days);

    return StatisticsQueryResult.create({
      histogram,
      median,
      categories: this.#categoriesProjection.get(),
      totalCount: result.totalCount,
    });
  }
}

function createWorkingHoursStatistics(activities: Activity[]) {
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

function createCycleTimesStatistics(activities: Activity[]) {
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
