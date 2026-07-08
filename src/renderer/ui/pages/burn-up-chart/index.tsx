// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import {
  createGetBurnUpQuery,
  createGetBurnUpQueryResult,
  type GetBurnUpQueryResult,
} from "../../../../shared/domain/read_models/get_burn_up.query";
import * as period from "../../components/period";
import CategoryComponent from "../../components/category.component";
import PeriodComponent from "../../components/period.component";
import BurnUpChartComponent from "./burn_up_chart.component";
import TotalThroughputComponent from "./total_throughput.component";

export default function BurnUpChartPage() {
  const [state, dispatch] = useReducer(period.reducer, { unit: period.PeriodUnit.MONTH }, period.init);
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState(createGetBurnUpQueryResult());

  useEffect(() => {
    const getBurnUpAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetBurnUpQueryResult>(
        createGetBurnUpQuery({
          from: state.from,
          to: state.to,
          categories,
        }),
      );
      setResult(result);
    };

    void getBurnUpAsync();
  }, [categories, state.from, state.to]);

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
                categories={result.categories}
                value={categories}
                onChange={(categories) => setCategories(categories)}
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "6rem" }}>
        <h2>Burn-up Chart</h2>
        <BurnUpChartComponent data={result.data} />
        <TotalThroughputComponent totalThroughput={result.totalThroughput} unit={state.unit} />
      </main>
    </>
  );
}
