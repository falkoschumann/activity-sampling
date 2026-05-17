// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import { ExportTimesheetCommand } from "../../../../shared/domain/export_timesheet_command";
import { TimesheetQuery, TimesheetQueryResult } from "../../../../shared/domain/timesheet_query";
import { changePeriod, goToNextPeriod, goToPreviousPeriod, init, PeriodUnit, reducer } from "../../../domain/period";
import { useMessageHandler } from "../../components/message_handler_context";
import { PeriodComponent } from "../../components/period_component";
import CapacityComponent from "./capacity";
import TimesheetComponent from "./timesheet";

export default function TimesheetPage() {
  const [state, dispatch] = useReducer(reducer, { unit: PeriodUnit.WEEK }, init);
  const [result, setResult] = useState(TimesheetQueryResult.create());
  const messageHandler = useMessageHandler();

  useEffect(() => {
    (async function () {
      const result = await messageHandler.queryTimesheet(
        TimesheetQuery.create({
          from: state.from,
          to: state.to,
        }),
      );
      setResult(result);
    })();
  }, [messageHandler, state.from, state.to]);

  async function handleExport() {
    await messageHandler.exportTimesheet(
      ExportTimesheetCommand.create({ timesheets: result.entries, fileName: "timesheets.csv" }),
    );
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
            units={[
              PeriodUnit.DAY,
              PeriodUnit.WEEK,
              PeriodUnit.MONTH,
              PeriodUnit.QUARTER,
              PeriodUnit.HALF_YEAR,
              PeriodUnit.YEAR,
            ]}
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
        <TimesheetComponent entries={result.entries} />
      </main>
      <footer className="fixed-bottom bg-body">
        <div className="container py-2">
          <CapacityComponent
            totalHours={result.totalHours}
            capacity={result.capacity.hours}
            offset={result.capacity.offset}
          />
        </div>
      </footer>
    </>
  );
}
