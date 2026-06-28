// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Histogram {
  static create({
    binEdges = [],
    frequencies = [],
    xAxisLabel = "",
    yAxisLabel = "",
  }: {
    binEdges?: string[];
    frequencies?: number[];
    xAxisLabel?: string;
    yAxisLabel?: string;
  } = {}) {
    return new Histogram(binEdges, frequencies, xAxisLabel, yAxisLabel);
  }

  static createTestInstance({
    binEdges = ["0", "0.5", "1", "2", "3", "5"],
    frequencies = [0, 1, 0, 0, 0],
    xAxisLabel = "Cycle times (days)",
    yAxisLabel = "Number of tasks",
  }: {
    binEdges?: string[];
    frequencies?: number[];
    xAxisLabel?: string;
    yAxisLabel?: string;
  } = {}) {
    return Histogram.create({ binEdges, frequencies, xAxisLabel, yAxisLabel });
  }

  readonly binEdges;
  readonly frequencies;
  readonly xAxisLabel;
  readonly yAxisLabel;

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
}
