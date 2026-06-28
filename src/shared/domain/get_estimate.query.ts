// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EstimateEntry } from "./estimate_entry";

export class GetEstimateQuery {
  static create({
    categories = [],
    timeZone = Temporal.Now.timeZoneId(),
  }: {
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new GetEstimateQuery(categories, timeZone);
  }

  static createTestInstance({
    categories = ["Feature"],
    timeZone = "Europe/Berlin",
  }: {
    categories?: string[];
    timeZone?: Temporal.TimeZoneLike;
  } = {}) {
    return GetEstimateQuery.create({ categories, timeZone });
  }

  readonly type = "get-estimate";
  readonly data;

  private constructor(categories: string[], timeZone: Temporal.TimeZoneLike) {
    this.data = {
      categories,
      timeZone,
    };
  }
}

export class GetEstimateQueryResult {
  static create({
    cycleTimes = [],
    categories = [],
    totalCount = 0,
  }: {
    cycleTimes?: EstimateEntry[];
    categories?: string[];
    totalCount?: number;
  } = {}) {
    return new GetEstimateQueryResult(cycleTimes, categories, totalCount);
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
    return GetEstimateQueryResult.create({
      cycleTimes,
      categories,
      totalCount,
    });
  }

  readonly cycleTimes;
  readonly categories;
  readonly totalCount;

  private constructor(
    cycleTimes: EstimateEntry[],
    categories: string[],
    totalCount: number,
  ) {
    this.cycleTimes = cycleTimes.map(EstimateEntry.create);
    this.categories = categories;
    this.totalCount = totalCount;
  }
}
