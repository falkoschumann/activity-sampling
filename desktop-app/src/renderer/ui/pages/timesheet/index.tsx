// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useReducer } from "react";

import { useTimesheet } from "../../../application/activities_service";
import { changePeriod, goToNextPeriod, goToPreviousPeriod, init, PeriodUnit, reducer } from "../../../domain/period";
import { PeriodComponent } from "../../components/period_component";
import CapacityComponent from "./capacity";
import TimesheetComponent from "./timesheet";

export default function TimesheetPage() {
  const [state, dispatch] = useReducer(reducer, { unit: PeriodUnit.WEEK }, init);

  const timesheet = useTimesheet(state);

  return (
    <>
      <aside className="fixed-top bg-body-secondary">
        <div className="container">
          <PeriodComponent
            from={state.from}
            to={state.to}
            unit={state.unit}
            isCurrent={state.isCurrent}
            units={[PeriodUnit.DAY, PeriodUnit.WEEK, PeriodUnit.MONTH]}
            onPreviousPeriod={() => dispatch(goToPreviousPeriod({}))}
            onNextPeriod={() => dispatch(goToNextPeriod({}))}
            onChangePeriod={(unit) => dispatch(changePeriod({ unit }))}
          />
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <TimesheetComponent entries={timesheet.entries} />
      </main>
      <footer className="fixed-bottom bg-body">
        <div className="container py-2">
          <CapacityComponent
            totalHours={timesheet.totalHours}
            capacity={timesheet.capacity.hours}
            offset={timesheet.capacity.offset}
          />
        </div>
      </footer>
    </>
  );
}
