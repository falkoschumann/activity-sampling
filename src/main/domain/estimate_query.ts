// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { normalizeDuration } from "../../shared/domain/temporal";
import { type Activity, initialReportReadModel } from "./report_read_model";

export function queryEstimate(
  readModel = initialReportReadModel,
  query: EstimateQuery,
): EstimateQueryResult {
  const entries = createEntries(readModel, query);
  const cycleTimes = determineCycleTimes(entries);
  const categories = readModel.categories.sort();
  const totalCount = entries.length;
  return EstimateQueryResult.create({ cycleTimes, categories, totalCount });
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

function determineCycleTimes(entries: Entry[]) {
  const cycleTimeCounts = new Map<number, number>();
  for (const entry of entries) {
    const frequency = cycleTimeCounts.get(entry.cycleTime) ?? 0;
    cycleTimeCounts.set(entry.cycleTime, frequency + 1);
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

export type Entry = {
  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;
  readonly cycleTime: number;
};
