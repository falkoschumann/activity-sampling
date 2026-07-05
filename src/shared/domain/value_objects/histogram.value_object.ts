// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface Histogram {
  readonly binEdges: string[];
  readonly frequencies: number[];
  readonly xAxisLabel: string;
  readonly yAxisLabel: string;
}

export function createHistogram({
  binEdges = [],
  frequencies = [],
  xAxisLabel = "",
  yAxisLabel = "",
}: {
  binEdges?: string[];
  frequencies?: number[];
  xAxisLabel?: string;
  yAxisLabel?: string;
} = {}): Histogram {
  return { binEdges, frequencies, xAxisLabel, yAxisLabel };
}
