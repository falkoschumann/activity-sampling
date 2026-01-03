// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import Chart from "chart.js/auto";
import { useEffect, useReducer, useRef } from "react";

import { useBurnUp } from "../../../application/burn_up_hook";
import { changePeriod, goToNextPeriod, goToPreviousPeriod, init, PeriodUnit, reducer } from "../../../domain/period";
import { PeriodComponent } from "../../components/period_component";

export default function BurnUpChartPage() {
  const [state, dispatch] = useReducer(reducer, { unit: PeriodUnit.MONTH }, init);
  const burnUp = useBurnUp(state);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const chart = new Chart(chartRef.current!, {
      type: "line",
      data: {
        labels: burnUp.data.map((d) => d.date.toLocaleString()),
        datasets: [
          {
            label: "Burn-up",
            data: burnUp.data.map((d) => d.cumulativeThroughput),
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
  }, [burnUp.data]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container-fluid">
          <PeriodComponent
            from={state.from}
            to={state.to}
            unit={state.unit}
            isCurrent={state.isCurrent}
            units={[PeriodUnit.WEEK, PeriodUnit.MONTH, PeriodUnit.QUARTER, PeriodUnit.HALF_YEAR, PeriodUnit.YEAR]}
            onPreviousPeriod={() => dispatch(goToPreviousPeriod({}))}
            onNextPeriod={() => dispatch(goToNextPeriod({}))}
            onChangePeriod={(unit) => dispatch(changePeriod({ unit }))}
          />
        </div>
      </aside>
      <main className="container-fluid my-4" style={{ paddingTop: "3rem" }}>
        <h2>Burn-up Chart</h2>
        <canvas ref={chartRef}></canvas>
        <div className="mt-3 mb-2">
          <p className="text-end">
            <strong>Throughput:</strong> {burnUp.totalThroughput} per {state.unit.toLowerCase()}
          </p>
        </div>
      </main>
    </>
  );
}
