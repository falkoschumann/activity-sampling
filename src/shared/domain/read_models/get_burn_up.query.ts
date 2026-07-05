// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ReportView } from "./report.read_model";
import {
  type Activity,
  selectDistinctCategories,
} from "../value_objects/activity.value_object";
import {
  type BurnUpData,
  createBurnUpData,
} from "../value_objects/burn_up_data.value_object";

export interface GetBurnUpQuery {
  readonly type: "get-burn-up";
  readonly data: GetBurnUpQueryData;
}

export type GetBurnUpQueryData = Readonly<{
  from: Temporal.PlainDateLike;
  to: Temporal.PlainDateLike;
  categories: string[];
  timeZone: Temporal.TimeZoneLike;
}>;

export function createGetBurnUpQuery({
  from,
  to,
  categories = [],
  timeZone = Temporal.Now.timeZoneId(),
}: {
  from: Temporal.PlainDateLike;
  to: Temporal.PlainDateLike;
  categories?: string[];
  timeZone?: Temporal.TimeZoneLike;
}): GetBurnUpQuery {
  return {
    type: "get-burn-up",
    data: { from, to, categories, timeZone },
  };
}

export interface GetBurnUpQueryResult {
  readonly data: BurnUpData[];
  readonly totalThroughput: number;
  readonly categories: string[];
}

export function createGetBurnUpQueryResult({
  data = [],
  totalThroughput = 0,
  categories = [],
}: {
  data?: BurnUpData[];
  totalThroughput?: number;
  categories?: string[];
} = {}): GetBurnUpQueryResult {
  return { data, totalThroughput, categories };
}

export function getBurnUp(
  view: ReportView,
  query: GetBurnUpQuery,
): GetBurnUpQueryResult {
  const activities = selectDistinctCategories(
    view.activities,
    query.data.categories,
  );
  const throughputs = determineThroughputs(activities);
  const data = fillPeriod(throughputs, query.data.from, query.data.to);
  const totalThroughput = determineTotalThroughput(data);
  return createGetBurnUpQueryResult({
    data,
    totalThroughput,
    categories: view.categories,
  });
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
  from: Temporal.PlainDateLike,
  to: Temporal.PlainDateLike,
) {
  if (throughputs.size === 0) {
    return [];
  }

  const data = [];
  let cumulativeThroughput = 0;
  for (
    let date = from;
    Temporal.PlainDate.compare(date, to) <= 0;
    date = Temporal.PlainDate.from(date).add({ days: 1 })
  ) {
    const dateStr = date.toString();
    if (throughputs.has(dateStr)) {
      const throughput = throughputs.get(dateStr)!;
      cumulativeThroughput += throughput;
      const updatedData = createBurnUpData({
        date: date.toString(),
        throughput,
        cumulativeThroughput,
      });
      data.push(updatedData);
    } else {
      const newData = createBurnUpData({
        date: date.toString(),
        throughput: 0,
        cumulativeThroughput,
      });
      data.push(newData);
    }
  }
  return data;
}

function determineTotalThroughput(data: BurnUpData[]) {
  return data.length > 0 ? data[data.length - 1]!.cumulativeThroughput : 0;
}
