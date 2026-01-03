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
    timeZone,
  }: {
    from: string;
    to: string;
    timeZone?: string;
  }): BurnUpQueryDto {
    return new BurnUpQueryDto(from, to, timeZone);
  }

  static fromModel(model: BurnUpQuery): BurnUpQueryDto {
    return BurnUpQueryDto.create({
      from: model.from.toString(),
      to: model.to.toString(),
      timeZone: model.timeZone?.toString(),
    });
  }

  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;

  private constructor(from: string, to: string, timeZone?: string) {
    this.from = from;
    this.to = to;
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
  }: {
    data?: BurnUpDataDto[];
    totalThroughput?: number;
  } = {}): BurnUpQueryResultDto {
    return new BurnUpQueryResultDto(data, totalThroughput);
  }

  static fromModel(model: BurnUpQueryResult): BurnUpQueryResultDto {
    const data = model.data.map((d) => BurnUpDataDto.fromModel(d));
    return BurnUpQueryResultDto.create({
      data,
      totalThroughput: model.totalThroughput,
    });
  }

  readonly data: BurnUpDataDto[];
  readonly totalThroughput: number;

  private constructor(data: BurnUpDataDto[], totalThroughput: number) {
    this.data = data;
    this.totalThroughput = totalThroughput;
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
