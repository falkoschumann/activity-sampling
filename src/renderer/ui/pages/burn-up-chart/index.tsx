// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useReducer } from "react";

import { useBurnUp } from "../../../application/burn_up_hook";
import * as period from "../../../domain/period";
import * as category from "../../../domain/category";
import CategoryComponent from "../../components/category";
import { PeriodComponent } from "../../components/period_component";
import BurnUpChartComponent from "./burn_up_chart";
import TotalThroughputComponent from "./total_throughput";

export default function BurnUpChartPage() {
  const [state, dispatch] = useReducer(reducer, { unit: period.PeriodUnit.MONTH }, init);
  const burnUp = useBurnUp(state);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <PeriodComponent
            from={state.from}
            to={state.to}
            unit={state.unit}
            isCurrent={state.isCurrent}
            units={[
              period.PeriodUnit.WEEK,
              period.PeriodUnit.MONTH,
              period.PeriodUnit.QUARTER,
              period.PeriodUnit.HALF_YEAR,
              period.PeriodUnit.YEAR,
            ]}
            onPreviousPeriod={() => dispatch(period.goToPreviousPeriod({}))}
            onNextPeriod={() => dispatch(period.goToNextPeriod({}))}
            onChangePeriod={(unit) => dispatch(period.changePeriod({ unit }))}
          />
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <div className="btn-group btn-group-sm" role="group" aria-label="Select category">
              <CategoryComponent
                categories={burnUp.categories}
                value={state.categories}
                onChange={(categories) => dispatch(category.setCategories({ categories }))}
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "6rem" }}>
        <h2>Burn-up Chart</h2>
        <BurnUpChartComponent data={burnUp.data} />
        <TotalThroughputComponent totalThroughput={burnUp.totalThroughput} unit={state.unit} />
      </main>
    </>
  );
}

type State = period.State & category.State;
type Action = period.Action | category.Action;

function init({ unit }: { unit: period.PeriodUnitType }): State {
  return {
    ...period.init({ unit }),
    ...category.init(),
  };
}

function reducer(state: State, action: Action): period.State & category.State {
  state = period.reducer(state, action as period.Action) as State;
  state = category.reducer(state, action as category.Action) as State;
  return state;
}
