// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  BurnUpData,
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { ActivitiesProjection, Activity } from "./activities_projection";
import type { ActivityLoggedEvent } from "./activity_logged_event";
import { CategoriesProjection } from "./categories_projection";
import type { Projection } from "./projection";

export class BurnUpProjection implements Projection<BurnUpQueryResult> {
  static create({
    query,
    timeZone = "Europe/Berlin",
  }: {
    query: BurnUpQuery;
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new BurnUpProjection(query, timeZone);
  }

  readonly #query;
  readonly #activitiesProjection;
  readonly #categoriesProjection;

  private constructor(query: BurnUpQuery, timeZone: Temporal.TimeZoneLike) {
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

  get(): BurnUpQueryResult {
    const activities = this.#activitiesProjection.get();
    const categories = this.#categoriesProjection.get();
    const throughputs = determineThroughputs(activities);
    const data = fillPeriod(throughputs, this.#query.from, this.#query.to);
    const totalThroughput = determineTotalThroughput(data);
    return BurnUpQueryResult.create({ data, totalThroughput, categories });
  }
}

function determineThroughputs(activities: Activity[]) {
  const throughputs = new Map<string, number>();
  for (const activity of activities) {
    const date = activity.finish.toString();
    const currentThroughput = throughputs.get(date) ?? 0;
    throughputs.set(date, currentThroughput + 1);
  }
  return throughputs;
}

function fillPeriod(
  throughputs: Map<string, number>,
  from: Temporal.PlainDate,
  to: Temporal.PlainDate,
) {
  if (throughputs.size === 0) {
    return [];
  }

  const data = [];
  let cumulativeThroughput = 0;
  for (
    let date = from;
    Temporal.PlainDate.compare(date, to) <= 0;
    date = date.add({ days: 1 })
  ) {
    const dateStr = date.toString();
    if (throughputs.has(dateStr)) {
      const throughput = throughputs.get(dateStr)!;
      cumulativeThroughput += throughput;
      data.push(
        BurnUpData.create({
          date,
          throughput,
          cumulativeThroughput,
        }),
      );
    } else {
      data.push(
        BurnUpData.create({
          date,
          throughput: 0,
          cumulativeThroughput,
        }),
      );
    }
  }
  return data;
}

function determineTotalThroughput(data: BurnUpData[]) {
  return data.length > 0 ? data[data.length - 1]!.cumulativeThroughput : 0;
}
