// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import {
  createGetReportQuery,
  createGetReportQueryResult,
  type GetReportQueryResult,
  ReportScope,
} from "../../../../shared/domain/read_models/get_report.query";
import * as period from "../../components/period";
import PeriodComponent from "../../components/period.component";
import ScopeComponent from "./scope.component";
import TimeReportComponent from "./time_report.component";
import TotalHoursComponent from "./total_hours.component";

export default function ReportPage() {
  const [state, dispatch] = useReducer(period.reducer, { unit: period.PeriodUnit.MONTH }, period.init);
  const [scope, setScope] = useState<ReportScope>(ReportScope.PROJECTS);
  const [report, setReport] = useState(createGetReportQueryResult());

  useEffect(() => {
    async function runAsync() {
      const result = await window.activitySampling.routeMessage<GetReportQueryResult>(
        createGetReportQuery({
          scope,
          from: state.from,
          to: state.to,
        }),
      );
      setReport(result);
    }

    void runAsync();
  }, [scope, state.from, state.to]);

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
        <TimeReportComponent scope={scope} entries={report.entries} />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container-fluid py-2">
          <TotalHoursComponent totalHours={report.totalHours} />
        </div>
      </footer>
    </>
  );
}
