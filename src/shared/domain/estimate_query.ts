// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class EstimateQuery {
  static create({
    categories,
    timeZone,
  }: {
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new EstimateQuery(categories, timeZone);
  }

  static createTestInstance({
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return EstimateQuery.create({ categories, timeZone });
  }

  readonly categories?: string[];
  readonly timeZone?: Temporal.TimeZoneLike;

  private constructor(categories?: string[], timeZone?: Temporal.TimeZoneLike) {
    this.categories = categories;
    this.timeZone = timeZone;
  }
}

export class EstimateQueryResult {
  static create({
    cycleTimes = [],
    categories = [],
    totalCount = 0,
  }: {
    cycleTimes?: EstimateEntry[];
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return new EstimateQueryResult(cycleTimes, categories, totalCount);
  }

  static createTestInstance({
    cycleTimes = [EstimateEntry.createTestInstance()],
    categories = ["Feature"],
    totalCount = 1,
  }: {
    cycleTimes?: EstimateEntry[];
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return EstimateQueryResult.create({ cycleTimes, categories, totalCount });
  }

  readonly cycleTimes: EstimateEntry[];
  readonly categories: string[];
  readonly totalCount: number;

  private constructor(
    cycleTimes: EstimateEntry[],
    categories: string[],
    totalCount: number,
  ) {
    this.cycleTimes = cycleTimes.map((entry) => EstimateEntry.create(entry));
    this.categories = categories;
    this.totalCount = totalCount;
  }
}

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
  }): EstimateEntry {
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
  } = {}): EstimateEntry {
    return EstimateEntry.create({
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    });
  }

  readonly cycleTime: number;
  readonly frequency: number;
  readonly probability: number;
  readonly cumulativeProbability: number;

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
