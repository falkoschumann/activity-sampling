// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Median {
  static create({
    edge0 = 0,
    edge25 = 0,
    edge50 = 0,
    edge75 = 0,
    edge100 = 0,
  }: {
    edge0?: number;
    edge25?: number;
    edge50?: number;
    edge75?: number;
    edge100?: number;
  } = {}) {
    return new Median(edge0, edge25, edge50, edge75, edge100);
  }

  static createTestInstance({
    edge0 = 0,
    edge25 = 0,
    edge50 = 1,
    edge75 = 0,
    edge100 = 0,
  }: {
    edge0?: number;
    edge25?: number;
    edge50?: number;
    edge75?: number;
    edge100?: number;
  } = {}) {
    return Median.create({ edge0, edge25, edge50, edge75, edge100 });
  }

  readonly edge0;
  readonly edge25;
  readonly edge50;
  readonly edge75;
  readonly edge100;

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
}
