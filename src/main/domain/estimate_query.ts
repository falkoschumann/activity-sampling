// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { createActivities } from "./activities";
import { initialReportReadModel } from "./report_read_model";

export function queryEstimate(
  readModel = initialReportReadModel,
  query: EstimateQuery,
): EstimateQueryResult {
  const entries = createActivities(readModel, query);
  const cycleTimes = determineCycleTimes(entries);
  const categories = readModel.categories.sort();
  const totalCount = entries.length;
  return EstimateQueryResult.create({ cycleTimes, categories, totalCount });
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
