// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useReducer, useState } from "react";

import { queryReport } from "../../../application/activities_service";
import { ReportQueryResult, Scope } from "../../../../shared/domain/activities";
import {
  changePeriod,
  goToNextPeriod,
  goToPreviousPeriod,
  init,
  PeriodUnit,
  reducer,
} from "../../../domain/period";
import { PeriodComponent } from "../../components/period_component";
import ScopeComponent from "./scope";
import TimeReportComponent from "./time_report";
import TotalHoursComponent from "./total_hours";

export default function ReportPage() {
  const [state, dispatch] = useReducer(
    reducer,
    { unit: PeriodUnit.WEEK },
    init,
  );
  const [scope, setScope] = useState<Scope>(Scope.PROJECTS);
  const [report, setReport] = useState(ReportQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryReport({
        scope,
        from: Temporal.PlainDate.from(state.from),
        to: Temporal.PlainDate.from(state.to),
      });
      setReport(result);
    })();
  }, [scope, state.from, state.to]);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <PeriodComponent
          from={state.from}
          to={state.to}
          unit={state.unit}
          isCurrent={state.isCurrent}
          units={[
            PeriodUnit.WEEK,
            PeriodUnit.MONTH,
            PeriodUnit.YEAR,
            PeriodUnit.ALL_TIME,
          ]}
          onPreviousPeriod={() => dispatch(goToPreviousPeriod({}))}
          onNextPeriod={() => dispatch(goToNextPeriod({}))}
          onChangePeriod={(unit) => dispatch(changePeriod({ unit }))}
        />
        <ScopeComponent
          scope={scope}
          onChangeScope={(scope) => setScope(scope)}
        />
      </aside>
      <main
        className="container my-4"
        style={{ paddingTop: "6rem", paddingBottom: "2.5rem" }}
      >
        <TimeReportComponent scope={scope} entries={report.entries} />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container py-2">
          <TotalHoursComponent totalHours={report.totalHours} />
        </div>
      </footer>
    </>
  );
}
