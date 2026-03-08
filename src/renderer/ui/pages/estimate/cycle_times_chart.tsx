// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

import { EstimateEntry } from "../../../../shared/domain/estimate_query";
import { thresholdPlugin, type ThresholdPluginOptions } from "./chart_threshold_plugin";

export default function CycleTimesChart({ cycleTimes }: { cycleTimes: EstimateEntry[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "bar",
      data: {
        labels: cycleTimes.map((entry) => String(entry.cycleTime)),
        datasets: [
          {
            label: "Frequencies",
            data: cycleTimes.map((entry) => entry.frequency),
            yAxisID: "y",
          },
          {
            label: "Cumulative Probability (%)",
            type: "line",
            data: cycleTimes.map((entry) => entry.cumulativeProbability * 100),
            yAxisID: "y1",
          },
        ],
      },
      options: {
        plugins: {
          // @ts-expect-error custom plugin options
          threshold: {
            value: 85,
            axis: "y1",
            color: "#ff6384",
            width: 1,
            dash: [6, 4],
            label: "85 %",
            labelColor: "#ff6384",
          } as ThresholdPluginOptions,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Cycle Time",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: "Frequency",
            },
          },
          y1: {
            beginAtZero: true,
            ticks: {
              stepSize: 5,
            },
            position: "right",
            title: {
              display: true,
              text: "Probability (%)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
      plugins: [thresholdPlugin],
    });

    return () => chart.destroy();
  }, [cycleTimes]);

  return <canvas ref={chartRef}></canvas>;
}
