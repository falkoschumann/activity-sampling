// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useReducer } from "react";

import { useTimesheet } from "../../../application/activities_service";
import { changePeriod, goToNextPeriod, goToPreviousPeriod, init, PeriodUnit, reducer } from "../../../domain/period";
import { PeriodComponent } from "../../components/period_component";
import CapacityComponent from "./capacity";
import TimesheetComponent from "./timesheet";
import { ExportTimesheetCommand } from "../../../../shared/domain/export_timesheet_command";

export default function TimesheetPage() {
  const [state, dispatch] = useReducer(reducer, { unit: PeriodUnit.WEEK }, init);

  const { timesheet, exportTimesheet } = useTimesheet(state);

  async function handleExport() {
    await exportTimesheet(ExportTimesheetCommand.create({ timesheets: timesheet.entries, fileName: "timesheets.csv" }));
  }

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
          <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
            <div className="btn-group btn-group-sm" role="group" aria-label="Select category">
              <button type="button" className="btn btn-outline-secondary" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "6rem", paddingBottom: "3rem" }}>
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
