// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type ActivityState,
  mergeCategories,
} from "./logged-activity/activity.aggregate";
import type { ReportView } from "./report.read_model";
import {
  type GetBurnUpQuery,
  GetBurnUpQueryResult,
} from "../../shared/domain/get_burn_up.query";
import { BurnUpData } from "../../shared/domain/burn_up_data";

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
