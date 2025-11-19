// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useRef } from "react";

const cycleTimeData = [
  { cycleTime: 1, frequency: 3, probability: "15%", cumulative: "15%" },
  { cycleTime: 2, frequency: 7, probability: "35%", cumulative: "50%" },
  { cycleTime: 3, frequency: 2, probability: "10%", cumulative: "60%" },
  { cycleTime: 4, frequency: 4, probability: "20%", cumulative: "80%" },
  { cycleTime: 5, frequency: 1, probability: "5%", cumulative: "85%" },
  { cycleTime: 6, frequency: 1, probability: "5%", cumulative: "90%" },
  { cycleTime: 7, frequency: 1, probability: "5%", cumulative: "95%" },
  { cycleTime: 8, frequency: 1, probability: "5%", cumulative: "100%" },
];

export default function EstimatePage() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "bar",
      data: {
        labels: cycleTimeData.map((item) => String(item.cycleTime)),
        datasets: [
          {
            label: "Frequencies of Cycle Times",
            data: cycleTimeData.map((item) => item.frequency),
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
  }, []);

  return (
    <main className="container my-4">
      <h1>Estimate</h1>
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
          {cycleTimeData.map((item, index) => (
            <tr key={index}>
              <td>{item.cycleTime}</td>
              <td>{item.frequency}</td>
              <td>{item.probability}</td>
              <td>{item.cumulative}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
