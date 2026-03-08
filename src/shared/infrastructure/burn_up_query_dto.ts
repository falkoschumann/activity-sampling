// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  BurnUpData,
  BurnUpQuery,
  BurnUpQueryResult,
} from "../domain/burn_up_query";

export class BurnUpQueryDto {
  static create({
    from,
    to,
    categories,
    timeZone,
  }: {
    from: string;
    to: string;
    categories?: string[];
    timeZone?: string;
  }): BurnUpQueryDto {
    return new BurnUpQueryDto(from, to, categories, timeZone);
  }

  static fromModel(model: BurnUpQuery): BurnUpQueryDto {
    return BurnUpQueryDto.create({
      from: model.from.toString(),
      to: model.to.toString(),
      categories: model.categories,
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly from: string;
  readonly to: string;
  readonly categories?: string[];
  readonly timeZone?: string;

  private constructor(
    from: string,
    to: string,
    categories?: string[],
    timeZone?: string,
  ) {
    this.from = from;
    this.to = to;
    this.categories = categories;
    this.timeZone = timeZone;
  }

  validate(): BurnUpQuery {
    return BurnUpQuery.create(this);
  }
}

export class BurnUpQueryResultDto {
  static create({
    data = [],
    totalThroughput = 0,
    categories,
  }: {
    data?: BurnUpDataDto[];
    totalThroughput?: number;
    readonly categories?: string[];
  } = {}): BurnUpQueryResultDto {
    return new BurnUpQueryResultDto(data, totalThroughput, categories);
  }

  static fromModel(model: BurnUpQueryResult): BurnUpQueryResultDto {
    const data = model.data.map((d) => BurnUpDataDto.fromModel(d));
    return BurnUpQueryResultDto.create({
      data,
      totalThroughput: model.totalThroughput,
      categories: model.categories,
    });
  }

  readonly data: BurnUpDataDto[];
  readonly totalThroughput: number;
  readonly categories?: string[];

  private constructor(
    data: BurnUpDataDto[],
    totalThroughput: number,
    categories?: string[],
  ) {
    this.data = data;
    this.totalThroughput = totalThroughput;
    this.categories = categories;
  }

  validate(): BurnUpQueryResult {
    const data = this.data.map((d) => BurnUpDataDto.create(d).validate());
    return BurnUpQueryResult.create({ ...this, data });
  }
}

export class BurnUpDataDto {
  static create({
    date,
    throughput,
    cumulativeThroughput,
  }: {
    date: string;
    throughput: number;
    cumulativeThroughput: number;
  }): BurnUpDataDto {
    return new BurnUpDataDto(date, throughput, cumulativeThroughput);
  }

  static fromModel(model: BurnUpData): BurnUpDataDto {
    return BurnUpDataDto.create({
      date: model.date.toString(),
      throughput: model.throughput,
      cumulativeThroughput: model.cumulativeThroughput,
    });
  }

  readonly date: string;
  readonly throughput: number;
  readonly cumulativeThroughput: number;

  constructor(date: string, throughput: number, cumulativeThroughput: number) {
    this.date = date;
    this.throughput = throughput;
    this.cumulativeThroughput = cumulativeThroughput;
  }

  validate(): BurnUpData {
    return BurnUpData.create(this);
  }
}
