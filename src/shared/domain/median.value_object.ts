// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface Median {
  readonly edge0: number;
  readonly edge25: number;
  readonly edge50: number;
  readonly edge75: number;
  readonly edge100: number;
}

export function createMedian({
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
} = {}): Median {
  return { edge0, edge25, edge50, edge75, edge100 };
}
