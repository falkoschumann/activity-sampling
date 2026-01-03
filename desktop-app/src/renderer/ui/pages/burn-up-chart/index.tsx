// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useReducer } from "react";

import { useBurnUp } from "../../../application/burn_up_hook";
import { changePeriod, goToNextPeriod, goToPreviousPeriod, init, PeriodUnit, reducer } from "../../../domain/period";
import { PeriodComponent } from "../../components/period_component";
import BurnUpChartComponent from "./burn_up_chart";
import TotalThroughputComponent from "./total_throughput";

export default function BurnUpChartPage() {
  const [state, dispatch] = useReducer(reducer, { unit: PeriodUnit.MONTH }, init);
  const burnUp = useBurnUp(state);

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
        <BurnUpChartComponent data={burnUp.data} />
        <TotalThroughputComponent totalThroughput={burnUp.totalThroughput} unit={state.unit} />
      </main>
    </>
  );
}
