// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../domain/estimate_query";

export class EstimateQueryDto {
  static create({
    categories,
    timeZone,
  }: {
    categories?: string[];
    timeZone?: string;
  }): EstimateQueryDto {
    return new EstimateQueryDto(categories, timeZone);
  }

  static fromModel(model: EstimateQuery): EstimateQueryDto {
    return EstimateQueryDto.create({
      categories: model.categories,
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly categories?: string[];
  readonly timeZone?: string;

  private constructor(categories?: string[], timeZone?: string) {
    this.categories = categories;
    this.timeZone = timeZone;
  }

  validate(): EstimateQuery {
    return EstimateQuery.create(this);
  }
}

export class EstimateQueryResultDto {
  static create({
    cycleTimes,
    categories,
    totalCount,
  }: {
    cycleTimes: EstimateEntryDto[];
    categories: string[];
    totalCount: number;
  }): EstimateQueryResultDto {
    return new EstimateQueryResultDto(
      cycleTimes.map((entry) => EstimateEntryDto.create(entry)),
      categories,
      totalCount,
    );
  }

  static fromModel(model: EstimateQueryResult): EstimateQueryResultDto {
    return EstimateQueryResultDto.create({
      cycleTimes: model.cycleTimes.map((entry) => EstimateEntryDto.from(entry)),
      categories: model.categories,
      totalCount: model.totalCount,
    });
  }

  readonly cycleTimes: EstimateEntryDto[];
  readonly categories: string[];
  readonly totalCount: number;

  private constructor(
    cycleTimes: EstimateEntryDto[],
    categories: string[],
    totalCount: number,
  ) {
    this.cycleTimes = cycleTimes;
    this.categories = categories;
    this.totalCount = totalCount;
  }

  validate(): EstimateQueryResult {
    return EstimateQueryResult.create({
      cycleTimes: this.cycleTimes.map((entry) =>
        EstimateEntryDto.create(entry).validate(),
      ),
      categories: this.categories,
      totalCount: this.totalCount,
    });
  }
}

export class EstimateEntryDto {
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
  }): EstimateEntryDto {
    return new EstimateEntryDto(
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    );
  }

  static from(model: EstimateEntry): EstimateEntryDto {
    return EstimateEntryDto.create({
      cycleTime: model.cycleTime,
      frequency: model.frequency,
      probability: model.probability,
      cumulativeProbability: model.cumulativeProbability,
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

  validate(): EstimateEntry {
    return EstimateEntry.create(this);
  }
}
