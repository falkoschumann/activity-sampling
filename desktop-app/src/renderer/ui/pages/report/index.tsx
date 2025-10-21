// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useReducer, useState } from "react";

import { useReport } from "../../../application/activities_service";
import { Scope, type ScopeType } from "../../../../shared/domain/activities";
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
    { unit: PeriodUnit.MONTH },
    init,
  );
  const [scope, setScope] = useState<ScopeType>(Scope.PROJECTS);

  const report = useReport({ ...state, scope });

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
            PeriodUnit.QUARTER,
            PeriodUnit.HALF_YEAR,
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
