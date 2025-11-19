// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";

import { useEstimate } from "../../../application/activities_service";
import { EstimateQuery } from "../../../../shared/domain/activities";

export default function EstimatePage() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  const [query] = useState<EstimateQuery>({});
  const estimate = useEstimate(query);

  console.log("Estimate", estimate);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "bar",
      data: {
        labels: estimate.cycleTimes.map((entry) => String(entry.cycleTime)),
        datasets: [
          {
            label: "Frequencies of Cycle Times",
            data: estimate.cycleTimes.map((entry) => entry.frequency),
          },
        ],
      },
      options: {
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
        },
      },
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
            <tr key={index}>
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
