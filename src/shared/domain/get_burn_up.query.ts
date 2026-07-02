// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type ActivityState,
  mergeCategories,
} from "./activity/activity.aggregate";
import type { ReportView } from "./report.read_model";
import { BurnUpData } from "./burn_up_data";

export class GetBurnUpQuery {
  static create({
    from,
    to,
    categories = [],
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    from: Temporal.PlainDateLike;
    to: Temporal.PlainDateLike;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetBurnUpQuery(from, to, categories, timeZone);
  }

  static createTestInstance({
    from = "2026-03-23",
    to = "2026-03-29",
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    from?: Temporal.PlainDateLike;
    to?: Temporal.PlainDateLike;
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetBurnUpQuery.create({ from, to, categories, timeZone });
  }

  readonly type = "get-burn-up";
  readonly data;

  private constructor(
    from: Temporal.PlainDateLike,
    to: Temporal.PlainDateLike,
    categories: string[],
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.data = {
      from: Temporal.PlainDate.from(from),
      to: Temporal.PlainDate.from(to),
      categories: categories,
      timeZone: timeZone,
    };
  }
}

export class GetBurnUpQueryResult {
  static create({
    data = [],
    totalThroughput = 0,
    categories = [],
  }: {
    data?: BurnUpData[];
    totalThroughput?: number;
    categories?: string[];
  } = {}) {
    return new GetBurnUpQueryResult(data, totalThroughput, categories);
  }

  static createTestInstance({
    data = [BurnUpData.createTestInstance()],
    totalThroughput = 1,
    categories = ["Feature"],
  }: {
    data?: BurnUpData[];
    totalThroughput?: number;
    categories?: string[];
  } = {}) {
    return GetBurnUpQueryResult.create({ data, totalThroughput, categories });
  }

  readonly data;
  readonly totalThroughput;
  readonly categories;

  private constructor(
    data: BurnUpData[],
    totalThroughput: number,
    categories: string[],
  ) {
    this.data = data.map(BurnUpData.create);
    this.totalThroughput = totalThroughput;
    this.categories = categories;
  }
}

export function getBurnUp(
  view: ReportView,
  query: GetBurnUpQuery,
): GetBurnUpQueryResult {
  const activities = mergeCategories(view.activities, query.data.categories);
  const throughputs = determineThroughputs(activities);
  const data = fillPeriod(throughputs, query.data.from, query.data.to);
  const totalThroughput = determineTotalThroughput(data);
  return GetBurnUpQueryResult.create({
    data,
    totalThroughput,
    categories: view.categories,
  });
}

function determineThroughputs(activities: ActivityState[]) {
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
