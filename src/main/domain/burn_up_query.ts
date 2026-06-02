// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  BurnUpData,
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { EstimateQuery } from "../../shared/domain/estimate_query";
import { normalizeDuration } from "../../shared/domain/temporal";
import { type Activity, initialReportReadModel } from "./report_read_model";

export function queryBurnUp(
  readModel = initialReportReadModel,
  query: BurnUpQuery,
): BurnUpQueryResult {
  const entries = createEntries(readModel, query);
  const throughputs = determineThroughputs(entries);
  const data = fillPeriod(throughputs, query.from, query.to);
  const totalThroughput = determineTotalThroughput(data);
  return BurnUpQueryResult.create({
    data,
    totalThroughput,
    categories: readModel.categories,
  });
}

function createEntries(
  readModel: typeof initialReportReadModel,
  query: EstimateQuery,
) {
  const entries: Entry[] = [];
  for (const activity of readModel.activities) {
    updateActivities(entries, activity, query);
  }
  entries.sort(compareEntry);
  return entries;
}

function updateActivities(
  entries: Entry[],
  activity: Activity,
  query: EstimateQuery,
) {
  if (!filterCategory(query.categories)(activity)) {
    return;
  }

  let start = activity.start.toZonedDateTimeISO(query.timeZone).toPlainDate();
  let finish = activity.finish.toZonedDateTimeISO(query.timeZone).toPlainDate();
  const index = entries.findIndex(
    (entry) =>
      entry.task === activity.task &&
      entry.project === activity.project &&
      entry.client === activity.client,
  );
  if (index == -1) {
    entries.push({
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      hours: activity.hours,
      cycleTime: finish.since(start).total("days") + 1,
    });
  } else {
    const entry = entries[index]!;
    start =
      Temporal.PlainDate.compare(start, entry.start) < 0 ? start : entry.start;
    finish =
      Temporal.PlainDate.compare(finish, entry.finish) > 0
        ? finish
        : entry.finish;
    entries[index] = {
      start,
      finish,
      client: activity.client,
      project: activity.project,
      task: activity.task,
      hours: normalizeDuration(activity.hours.add(entry.hours)),
      cycleTime: finish.since(start).total("days") + 1,
    };
  }
}

function filterCategory(categories: string[]) {
  return (activity: Activity) =>
    categories.length === 0 || categories.includes(activity.category ?? "");
}

function compareEntry(a: Entry, b: Entry) {
  const taskComparison = a.task.localeCompare(b.task);
  if (taskComparison !== 0) {
    return taskComparison;
  }

  const projectComparison = a.project.localeCompare(b.project);
  if (projectComparison !== 0) {
    return projectComparison;
  }

  return a.client.localeCompare(b.client);
}

export type Entry = {
  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;
  readonly cycleTime: number;
};

function determineThroughputs(activities: Entry[]) {
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
