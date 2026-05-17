// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import { ReportQuery, ReportQueryResult, ReportScope } from "../../../../shared/domain/report_query";
import * as period from "../../../domain/period";
import { useMessageHandler } from "../../components/message_handler_context";
import { PeriodComponent } from "../../components/period_component";
import ScopeComponent from "./scope";
import TimeReportComponent from "./time_report";
import TotalHoursComponent from "./total_hours";

export default function ReportPage() {
  const [state, dispatch] = useReducer(period.reducer, { unit: period.PeriodUnit.MONTH }, period.init);
  const [scope, setScope] = useState<ReportScope>(ReportScope.PROJECTS);
  const [result, setResult] = useState(ReportQueryResult.create());
  const messageHandler = useMessageHandler();

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.queryReport(
        ReportQuery.create({
          scope,
          from: state.from,
          to: state.to,
        }),
      );
      setResult(result);
    }

    void runAsync();
  }, [messageHandler, scope, state.from, state.to]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container-fluid">
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
              period.PeriodUnit.ALL_TIME,
            ]}
            onPreviousPeriod={() => dispatch(period.goToPreviousPeriod({}))}
            onNextPeriod={() => dispatch(period.goToNextPeriod({}))}
            onChangePeriod={(unit) => dispatch(period.changePeriod({ unit }))}
          />
          <ScopeComponent scope={scope} onChangeScope={(scope) => setScope(scope)} />
        </div>
      </aside>
      <main className="container-fluid my-4" style={{ paddingTop: "6rem", paddingBottom: "2.5rem" }}>
        <TimeReportComponent scope={scope} entries={result.entries} />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container-fluid py-2">
          <TotalHoursComponent totalHours={result.totalHours} />
        </div>
      </footer>
    </>
  );
}
