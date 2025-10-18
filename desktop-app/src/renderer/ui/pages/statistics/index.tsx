// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import { useStatistics } from "../../../application/activities_service";

export default function StatisticsPage() {
  const histogramRef = useRef<HTMLCanvasElement>(null);

  const [query] = useState({});
  const statistics = useStatistics(query);
  console.log("statistics query result:", statistics);

  useEffect(() => {
    const chart = new Chart(histogramRef.current!, {
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
    <div className="vw-100 vh-100 p-4">
      <h2>Histogram</h2>
      <canvas ref={histogramRef}></canvas>
      <h2>Median</h2>
      <div className="mt-3 mb-2">
        <div className="progress-stacked" style={{ height: "1.5rem" }}>
          <div
            className="progress"
            role="progressbar"
            aria-label="Segment one"
            aria-valuenow={25}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: "25%" }}
          >
            <div
              className="progress-bar bg-secondary"
              style={{ height: "1.5rem" }}
            >
              &lt; {statistics.median.edge25} days
            </div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Segment two"
            aria-valuenow={50}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: "50%" }}
          >
            <div
              className="progress-bar bg-primary"
              style={{ height: "1.5rem" }}
            >
              {statistics.median.edge50} days
            </div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label="Segment three"
            aria-valuenow={25}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: "25%" }}
          >
            <div
              className="progress-bar bg-secondary"
              style={{ height: "1.5rem" }}
            >
              &gt; {statistics.median.edge75} days
            </div>
          </div>
        </div>
      </div>
      <p className="small">
        {statistics.median.edge50} person days (median): 50% of the records are
        above this value and 50% are below.
      </p>
      <p className="small">
        {statistics.median.edge25} person days (lower quartile) and{" "}
        {statistics.median.edge75} person days (upper quartile): 25% of the
        records are below or above these values, respectively.
      </p>
      <p className="small">Tasks shorter than half a day will be ignored.</p>
    </div>
  );
}
