// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import { createExportTimesheetCommand } from "../../../../shared/domain/activity/export_timesheet.command";
import {
  createGetTimesheetQuery,
  createGetTimesheetQueryResult,
  type GetTimesheetQueryResult,
} from "../../../../shared/domain/read_models/get_timesheet.query";
import { changePeriod, goToNextPeriod, goToPreviousPeriod, init, PeriodUnit, reducer } from "../../components/period";
import PeriodComponent from "../../components/period.component";
import CapacityComponent from "./capacity.component";
import TimesheetComponent from "./timesheet.component";

export default function TimesheetPage() {
  const [state, dispatch] = useReducer(reducer, { unit: PeriodUnit.WEEK }, init);
  const [client, setClient] = useState<string>();
  const [project, setProject] = useState<string>();
  const [isDisplayCategory, setDisplayCategory] = useState(false);
  const [timesheet, setTimesheet] = useState(createGetTimesheetQueryResult());

  useEffect(() => {
    const getTimesheetAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetTimesheetQueryResult>(
        createGetTimesheetQuery({
          from: state.from,
          to: state.to,
          client,
          project,
          isDisplayCategory,
        }),
      );
      setTimesheet(result);
    };

    void getTimesheetAsync();
  }, [state.from, state.to, client, project, isDisplayCategory]);

  async function handleExport() {
    const returnValue = await window.activitySampling.showSaveDialog({
      title: "Export timesheet",
      defaultPath: "timesheet.csv",
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      properties: ["createDirectory"],
    });
    if (returnValue.canceled) {
      return;
    }

    const command = createExportTimesheetCommand({ timesheets: timesheet.entries, filename: returnValue.filePath });
    await window.activitySampling.routeMessage(command);
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
          <div
            className="btn-toolbar py-2 gap-2"
            role="toolbar"
            aria-label="Toolbar with query parameters and commands"
          >
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {client != null ? client : "All clients"}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={() => setClient(undefined)}>
                    All clients
                  </button>
                </li>
                {timesheet.clients.length > 0 && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}
                {timesheet.clients.map((client) => (
                  <li key={client}>
                    <button className="dropdown-item" onClick={() => setClient(client)}>
                      {client}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {project != null ? project : "All projects"}
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={() => setProject(undefined)}>
                    All projects
                  </button>
                </li>
                {timesheet.projects.length > 0 && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}
                {timesheet.projects.map((project) => (
                  <li key={project}>
                    <button className="dropdown-item" onClick={() => setProject(project)}>
                      {project}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div>
                <input
                  type="checkbox"
                  className="btn-check"
                  id="btn-display-category"
                  checked={isDisplayCategory}
                  onChange={(e) => setDisplayCategory(e.target.checked)}
                  autoComplete="off"
                />
                <label className="btn btn-outline-secondary btn-sm" htmlFor="btn-display-category">
                  Display category
                </label>
              </div>
            </div>
            <div className="ms-auto">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main className="container my-4" style={{ paddingTop: "6rem", paddingBottom: "3rem" }}>
        <TimesheetComponent entries={timesheet.entries} isDisplayCategory={isDisplayCategory} />
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
