// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { ActivityLoggedEvent } from "../../shared/domain/activities";
import {
  BurnUpData,
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { ActivitiesProjection, Activity, filterEvents } from "./activities";

export async function projectBurnUp(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: BurnUpQuery,
): Promise<BurnUpQueryResult> {
  const activities = await projectActivities(replay, query);
  const throughputs = determineThroughputs(activities);
  const data = fillPeriod(throughputs, query.from, query.to);
  const totalThroughput = determineTotalThroughput(data);
  return BurnUpQueryResult.create({ data, totalThroughput });
}

async function projectActivities(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: BurnUpQuery,
) {
  const activitiesProjection = new ActivitiesProjection();
  for await (const event of filterEvents(replay, query.from, query.to)) {
    activitiesProjection.update(event);
  }
  return activitiesProjection.get();
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
  let throughput = 0;
  let cumulativeThroughput = 0;
  for (
    let date = from;
    Temporal.PlainDate.compare(date, to) <= 0;
    date = date.add({ days: 1 })
  ) {
    const dateStr = date.toString();
    if (throughputs.has(dateStr)) {
      throughput = throughputs.get(dateStr)!;
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
  return data.length > 0 ? data[data.length - 1].cumulativeThroughput : 0;
}
