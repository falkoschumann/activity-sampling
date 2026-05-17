// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import { BurnUpQuery, BurnUpQueryResult } from "../../../../shared/domain/burn_up_query";
import * as period from "../../../domain/period";
import CategoryComponent from "../../components/category";
import { useMessageHandler } from "../../components/message_handler_context";
import { PeriodComponent } from "../../components/period_component";
import BurnUpChartComponent from "./burn_up_chart";
import TotalThroughputComponent from "./total_throughput";

export default function BurnUpChartPage() {
  const [state, dispatch] = useReducer(period.reducer, { unit: period.PeriodUnit.MONTH }, period.init);
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState(BurnUpQueryResult.create());
  const messageHandler = useMessageHandler();

  useEffect(() => {
    (async function () {
      const result = await messageHandler.queryBurnUp(
        BurnUpQuery.create({
          from: state.from,
          to: state.to,
          categories,
        }),
      );
      setResult(result);
    })();
  }, [messageHandler, categories, state.from, state.to]);

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
