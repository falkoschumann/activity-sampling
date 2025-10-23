// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

import type { Histogram } from "../../../../shared/domain/activities";

export default function HistogramComponent({ histogram }: { histogram: Histogram }) {
  const histogramRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const chart = new Chart(histogramRef.current!, {
      type: "bar",
      data: {
        labels: histogram.binEdges.slice(0, -1).map((edge, index) => {
          return `${edge} .. ${histogram.binEdges[index + 1]}`;
        }),
        datasets: [
          {
            label: "Frequencies of task durations",
            data: histogram.frequencies,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: histogram.xAxisLabel,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: histogram.yAxisLabel,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [histogram]);

  return (
    <>
      <h2>Histogram</h2>
      <canvas ref={histogramRef}></canvas>
    </>
  );
}
