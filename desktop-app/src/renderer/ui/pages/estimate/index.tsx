// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";

import { useEstimate } from "../../../application/activities_service";
import { EstimateQuery } from "../../../../shared/domain/activities";
import { thresholdPlugin, type ThresholdPluginOptions } from "./chart_threshold_plugin";

export default function EstimatePage() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  const [query] = useState<EstimateQuery>({});
  const estimate = useEstimate(query);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "bar",
      data: {
        labels: estimate.cycleTimes.map((entry) => String(entry.cycleTime)),
        datasets: [
          {
            label: "Frequencies",
            data: estimate.cycleTimes.map((entry) => entry.frequency),
            yAxisID: "y",
          },
          {
            label: "Cumulative Probability (%)",
            type: "line",
            data: estimate.cycleTimes.map((entry) => entry.cumulativeProbability * 100),
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
  }, [estimate.cycleTimes]);

  return (
    <main className="container my-4">
      <h2>Cycle Time</h2>
      <canvas ref={chartRef}></canvas>
      <table className="table mt-3">
        <thead className="sticky-top">
          <tr>
            <th scope="row">Cycle Time</th>
            <th scope="row">Frequency</th>
            <th scope="row">Probability</th>
            <th scope="row">Cumulative</th>
          </tr>
        </thead>
        <tbody>
          {estimate.cycleTimes.map((item, index) => (
            <tr key={index} className={item.cumulativeProbability >= 0.85 ? "table-success" : "table-warning"}>
              <td>{item.cycleTime}</td>
              <td>{item.frequency}</td>
              <td>{Math.round(item.probability * 100)}&nbsp;%</td>
              <td>{Math.round(item.cumulativeProbability * 100)}&nbsp;%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
