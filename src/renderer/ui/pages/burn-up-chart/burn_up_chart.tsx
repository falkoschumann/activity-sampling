// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { BurnUpData } from "../../../../shared/domain/burn_up_query";

export default function BurnUpChartComponent({ data }: { data: BurnUpData[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "line",
      data: {
        labels: data.map((d) => d.date.toLocaleString()),
        datasets: [
          {
            label: "Burn-up",
            data: data.map((d) => d.cumulativeThroughput),
            fill: true,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
            ticks: {
              maxTicksLimit: 31,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Cumulative Throughput",
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={chartRef}></canvas>;
}
