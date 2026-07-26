// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import {
  createGetBurnUpQuery,
  createGetBurnUpQueryResult,
  type GetBurnUpQueryResult,
} from "../../../../shared/domain/read_models/get_burn_up.query";
import {
  createGetCategoriesQuery,
  createGetCategoriesQueryResult,
  type GetCategoriesQueryResult,
} from "../../../../shared/domain/read_models/get_categories.query";
import * as period from "../../components/period";
import CategoryComponent from "../../components/category.component";
import PeriodComponent from "../../components/period.component";
import BurnUpChartComponent from "./burn_up_chart.component";
import TotalThroughputComponent from "./total_throughput.component";

export default function BurnUpChartPage() {
  const [state, dispatch] = useReducer(period.reducer, { unit: period.PeriodUnit.MONTH }, period.init);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [categories, setCategories] = useState(createGetCategoriesQueryResult());
  const [burnUp, setBurnUp] = useState(createGetBurnUpQueryResult());

  useEffect(() => {
    const getCategoriesAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetCategoriesQueryResult>(createGetCategoriesQuery());
      setCategories(result);
    };

    const getBurnUpAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetBurnUpQueryResult>(
        createGetBurnUpQuery({
          from: state.from,
          to: state.to,
          categories: categoryFilter,
        }),
      );
      setBurnUp(result);
    };

    void getCategoriesAsync();
    void getBurnUpAsync();
  }, [categoryFilter, state.from, state.to]);

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
                categories={categories.categories}
                value={categoryFilter}
                onChange={(categories) => setCategoryFilter(categories)}
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
