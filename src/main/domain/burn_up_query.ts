// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  BurnUpData,
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { type Activity, createActivities } from "./activities";
import { initialReportReadModel } from "./report_read_model";

export function queryBurnUp(
  readModel = initialReportReadModel,
  query: BurnUpQuery,
): BurnUpQueryResult {
  const entries = createActivities(readModel, query);
  const throughputs = determineThroughputs(entries);
  const data = fillPeriod(throughputs, query.from, query.to);
  const totalThroughput = determineTotalThroughput(data);
  return BurnUpQueryResult.create({
    data,
    totalThroughput,
    categories: readModel.categories,
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
