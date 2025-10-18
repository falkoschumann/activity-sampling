// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import { useStatistics } from "../../../application/activities_service";

export default function StatisticsPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  const [query] = useState({});
  const statistics = useStatistics(query);
  console.log("statistics query result:", statistics);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "bar",
      data: {
        labels: statistics.histogram.binEdges
          .slice(0, -1)
          .map((edge, index) => {
            return `${edge} .. ${statistics.histogram.binEdges[index + 1]}`;
          }),
        datasets: [
          {
            label: "Frequencies of task durations",
            data: statistics.histogram.frequencies,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: statistics.histogram.xAxisLabel,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: statistics.histogram.yAxisLabel,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [statistics.histogram]);

  return (
    <div className="vw-100 vh-100">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
