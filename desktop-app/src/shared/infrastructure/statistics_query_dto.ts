// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  Histogram,
  Median,
  StatisticsQuery,
  StatisticsQueryResult,
  type StatisticsScopeType,
} from "../domain/statistics_query";

export class StatisticsQueryDto {
  static create({
    scope,
    categories,
    timeZone,
  }: {
    scope: StatisticsScopeType;
    categories?: string[];
    timeZone?: string;
  }): StatisticsQueryDto {
    return new StatisticsQueryDto(scope, categories, timeZone);
  }

  static fromModel(model: StatisticsQuery): StatisticsQueryDto {
    return StatisticsQueryDto.create({
      scope: model.scope,
      categories: model.categories,
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly scope: StatisticsScopeType;
  readonly categories?: string[];
  readonly timeZone?: string;

  private constructor(
    scope: StatisticsScopeType,
    categories?: string[],
    timeZone?: string,
  ) {
    this.scope = scope;
    this.categories = categories;
    this.timeZone = timeZone;
  }

  validate(): StatisticsQuery {
    return StatisticsQuery.create(this);
  }
}

export class StatisticsQueryResultDto {
  static create({
    histogram,
    median,
    categories,
    totalCount,
  }: {
    histogram: {
      binEdges: string[];
      frequencies: number[];
      xAxisLabel: string;
      yAxisLabel: string;
    };
    median: {
      edge0: number;
      edge25: number;
      edge50: number;
      edge75: number;
      edge100: number;
    };
    categories: string[];
    totalCount: number;
  }): StatisticsQueryResultDto {
    return new StatisticsQueryResultDto(
      HistogramDto.create(histogram),
      MedianDto.create(median),
      categories,
      totalCount,
    );
  }

  static fromModel(model: StatisticsQueryResult): StatisticsQueryResultDto {
    return StatisticsQueryResultDto.create({
      histogram: HistogramDto.from(model.histogram),
      median: MedianDto.from(model.median),
      categories: model.categories,
      totalCount: model.totalCount,
    });
  }

  readonly histogram: HistogramDto;
  readonly median: MedianDto;
  readonly categories: string[];
  readonly totalCount: number;

  private constructor(
    histogram: HistogramDto,
    median: MedianDto,
    categories: string[],
    totalCount: number,
  ) {
    this.histogram = histogram;
    this.median = median;
    this.categories = categories;
    this.totalCount = totalCount;
  }

  validate(): StatisticsQueryResult {
    return StatisticsQueryResult.create({
      histogram: this.histogram.validate(),
      median: this.median.validate(),
      categories: this.categories,
      totalCount: this.totalCount,
    });
  }
}

export class HistogramDto {
  static create({
    binEdges,
    frequencies,
    xAxisLabel,
    yAxisLabel,
  }: {
    binEdges: string[];
    frequencies: number[];
    xAxisLabel: string;
    yAxisLabel: string;
  }): HistogramDto {
    return new HistogramDto(binEdges, frequencies, xAxisLabel, yAxisLabel);
  }

  static from(model: {
    binEdges: string[];
    frequencies: number[];
    xAxisLabel: string;
    yAxisLabel: string;
  }): HistogramDto {
    return HistogramDto.create({
      binEdges: model.binEdges,
      frequencies: model.frequencies,
      xAxisLabel: model.xAxisLabel,
      yAxisLabel: model.yAxisLabel,
    });
  }

  readonly binEdges: string[];
  readonly frequencies: number[];
  readonly xAxisLabel: string;
  readonly yAxisLabel: string;

  private constructor(
    binEdges: string[],
    frequencies: number[],
    xAxisLabel: string,
    yAxisLabel: string,
  ) {
    this.binEdges = binEdges;
    this.frequencies = frequencies;
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
  }

  validate(): Histogram {
    return Histogram.create({
      binEdges: this.binEdges,
      frequencies: this.frequencies,
      xAxisLabel: this.xAxisLabel,
      yAxisLabel: this.yAxisLabel,
    });
  }
}

export class MedianDto {
  static create({
    edge0,
    edge25,
    edge50,
    edge75,
    edge100,
  }: {
    edge0: number;
    edge25: number;
    edge50: number;
    edge75: number;
    edge100: number;
  }) {
    return new MedianDto(edge0, edge25, edge50, edge75, edge100);
  }

  static from(model: Median): MedianDto {
    return MedianDto.create({
      edge0: model.edge0,
      edge25: model.edge25,
      edge50: model.edge50,
      edge75: model.edge75,
      edge100: model.edge100,
    });
  }

  readonly edge0: number;
  readonly edge25: number;
  readonly edge50: number;
  readonly edge75: number;
  readonly edge100: number;

  private constructor(
    edge0: number,
    edge25: number,
    edge50: number,
    edge75: number,
    edge100: number,
  ) {
    this.edge0 = edge0;
    this.edge25 = edge25;
    this.edge50 = edge50;
    this.edge75 = edge75;
    this.edge100 = edge100;
  }

  validate(): Median {
    return {
      edge0: this.edge0,
      edge25: this.edge25,
      edge50: this.edge50,
      edge75: this.edge75,
      edge100: this.edge100,
    };
  }
}
