// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface EstimateEntry {
  readonly cycleTime: number;
  readonly frequency: number;
  readonly probability: number;
  readonly cumulativeProbability: number;
}

export function createEstimateEntry({
  cycleTime,
  frequency,
  probability,
  cumulativeProbability,
}: {
  cycleTime: number;
  frequency: number;
  probability: number;
  cumulativeProbability: number;
}): EstimateEntry {
  return { cycleTime, frequency, probability, cumulativeProbability };
}
