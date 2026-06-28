// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class EstimateEntry {
  static create({
    cycleTime,
    frequency,
    probability,
    cumulativeProbability,
  }: {
    cycleTime: number;
    frequency: number;
    probability: number;
    cumulativeProbability: number;
  }) {
    return new EstimateEntry(
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    );
  }

  static createTestInstance({
    cycleTime = 1,
    frequency = 1,
    probability = 1.0,
    cumulativeProbability = 1.0,
  }: {
    cycleTime?: number;
    frequency?: number;
    probability?: number;
    cumulativeProbability?: number;
  } = {}) {
    return EstimateEntry.create({
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    });
  }

  readonly cycleTime;
  readonly frequency;
  readonly probability;
  readonly cumulativeProbability;

  private constructor(
    cycleTime: number,
    frequency: number,
    probability: number,
    cumulativeProbability: number,
  ) {
    this.cycleTime = cycleTime;
    this.frequency = frequency;
    this.probability = probability;
    this.cumulativeProbability = cumulativeProbability;
  }
}
