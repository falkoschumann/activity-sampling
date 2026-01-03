// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { ActivityLoggedEvent } from "../../shared/domain/activities";
import {
  BurnUpData,
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { ActivitiesProjection, Activity, filterEvents } from "./activities";
import { Temporal } from "@js-temporal/polyfill";

export async function projectBurnUp(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: BurnUpQuery,
): Promise<BurnUpQueryResult> {
  const activitiesProjection = new ActivitiesProjection();
  for await (const event of filterEvents(replay, query.from, query.to)) {
    activitiesProjection.update(event);
  }
  const activities = activitiesProjection.get();
  const { throughputs, from, to } = determineThroughputs(
    activities,
    query.from,
    query.to,
  );
  const data = fillPeriod(throughputs, from, to);
  const totalThroughput =
    data.length > 0 ? data[data.length - 1].cumulativeThroughput : 0;
  return BurnUpQueryResult.create({ data, totalThroughput });
}

function determineThroughputs(
  activities: Activity[],
  from?: Temporal.PlainDate,
  to?: Temporal.PlainDate,
) {
  const throughputs = new Map<string, number>();
  for (const activity of activities) {
    const date = activity.finish.toString();
    if (!from || Temporal.PlainDate.compare(activity.finish, from) < 0) {
      from = activity.finish;
    }
    if (!to || Temporal.PlainDate.compare(activity.finish, to) > 0) {
      to = activity.finish;
    }
    const currentThroughput = throughputs.get(date) ?? 0;
    throughputs.set(date, currentThroughput + 1);
  }
  return { throughputs, from, to };
}

function fillPeriod(
  throughputs: Map<string, number>,
  from: Temporal.PlainDate | undefined,
  to: Temporal.PlainDate | undefined,
) {
  if (throughputs.size === 0 || !from || !to) {
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
