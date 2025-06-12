// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectError } from "../../application/log_slice";
import { AppDispatch } from "../../application/store";
import {
  queryTimesheet,
  selectTimesheet,
  selectTimeZone,
  selectWorkingHoursSummary,
} from "../../application/timesheet_slice";
import { Duration } from "../../common/duration";
import { TimesheetEntry } from "../../domain/activities";
import ErrorComponent from "../components/error_component";
import PageLayout from "../layouts/page_layout";

export default function TimesheetPage() {
  const timesheet = useSelector(selectTimesheet);
  const workingHoursSummary = useSelector(selectWorkingHoursSummary);
  const timeZone = useSelector(selectTimeZone);
  const error = useSelector(selectError);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryTimesheet({ startInclusive: "2025-06-02", endExclusive: "2025-06-09" }));
  }, [dispatch]);

  return (
    <PageLayout>
      <PeriodContainer />
      <main className="container my-4" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
        <ErrorComponent {...error} />
        <TimesheetContainer entries={timesheet} timeZone={timeZone} />
      </main>
      <footer className="fixed-bottom bg-body">
        <div className="container py-2">
          <CapacityComponent {...workingHoursSummary} />
        </div>
      </footer>
    </PageLayout>
  );
}

function PeriodContainer() {
  return (
    <aside className="fixed-top bg-body-secondary" style={{ marginTop: "3.5rem" }}>
      <div className="container">
        <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with navigation buttons">
          <div className="btn-group btn-group-sm" role="group" aria-label="Navigation buttons">
            <button type="button" className="btn btn-toolbar">
              <i className="bi bi-chevron-left"></i>
            </button>
            <button type="button" className="btn btn-toolbar">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <div className="align-content-center">
            <strong>This Week:</strong> 02.06.2025 - 08.06.2025
          </div>
          <div className="dropdown ms-auto">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Week
            </button>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#">
                  Day
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Week
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Month
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TimesheetContainer({ entries, timeZone }: { entries: TimesheetEntry[]; timeZone: string }) {
  return (
    <table className="table">
      <thead className="sticky-top" style={{ top: "6.4375rem" }}>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Client</th>
          <th scope="col">Project</th>
          <th scope="col">Task</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td>{new Date(entry.date).toLocaleDateString(undefined, { dateStyle: "medium", timeZone })}</td>
            <td>{entry.client}</td>
            <td>{entry.project}</td>
            <td>{entry.task}</td>
            <td>{Duration.parse(entry.hours).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CapacityComponent({ totalHours, offset, capacity }: { totalHours: string; offset: string; capacity: string }) {
  const totalHoursInSeconds = Duration.parse(totalHours).seconds;
  const offsetInSeconds = Duration.parse(offset).seconds;
  const capacityInSeconds = Duration.parse(capacity).seconds;
  const progress = (totalHoursInSeconds / capacityInSeconds) * 100;
  const isBehind = offsetInSeconds < 0;
  const isAhead = offsetInSeconds > 0;
  const color = isAhead ? "bg-success" : isBehind ? "bg-warning" : "bg-primary";
  return (
    <div className="small text-secondary">
      <div className="d-flex justify-content-end gap-2">
        {isBehind && <div className="text-warning">{Duration.parse(offset).abs().toLocaleString()} Behind</div>}
        {isAhead && <div className="text-success">{Duration.parse(offset).toLocaleString()} Ahead</div>}
        <div>
          {Duration.parse(totalHours).toLocaleString()} / {Duration.parse(capacity).toLocaleString()}
        </div>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Work in progress"
        aria-valuenow={totalHoursInSeconds}
        aria-valuemin={0}
        aria-valuemax={capacityInSeconds}
      >
        <div className={`progress-bar ${color}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
