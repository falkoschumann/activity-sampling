// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectError } from "../../application/log_slice";
import { AppDispatch } from "../../application/store";
import {
  queryTimesheet,
  selectEntries,
  selectPeriod,
  selectTimeZone,
  selectWorkingHoursSummary,
} from "../../application/timesheet_slice";
import ErrorComponent from "../components/error_component";
import PageLayout from "../layouts/page_layout";

export default function TimesheetPage() {
  const error = useSelector(selectError);
  return (
    <PageLayout>
      <PeriodContainer />
      <main className="container my-4" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
        <ErrorComponent {...error} />
        <TimesheetContainer />
      </main>
      <footer className="fixed-bottom bg-body">
        <div className="container py-2">
          <CapacityComponent />
        </div>
      </footer>
    </PageLayout>
  );
}

function PeriodContainer() {
  const { from, to } = useSelector(selectPeriod);
  const timeZone = useSelector(selectTimeZone);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryTimesheet({ from, to }));
  }, [dispatch, from, to]);

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
            <strong>This Week:</strong>{" "}
            {new Date(from).toLocaleDateString(undefined, {
              dateStyle: "medium",
              timeZone,
            })}{" "}
            - {new Date(to).toLocaleDateString(undefined, { dateStyle: "medium", timeZone })}
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

function TimesheetContainer() {
  const entries = useSelector(selectEntries);
  const timeZone = useSelector(selectTimeZone);

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
            <td>{formatDuration(entry.hours)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CapacityComponent() {
  const { totalHours, offset, capacity } = useSelector(selectWorkingHoursSummary);
  const totalHoursInSeconds = Temporal.Duration.from(totalHours).total("seconds");
  const offsetInSeconds = Temporal.Duration.from(offset).total("seconds");
  const capacityInSeconds = Temporal.Duration.from(capacity).total("seconds");
  const progress = (totalHoursInSeconds / capacityInSeconds) * 100;
  const isBehind = offsetInSeconds < 0;
  const isAhead = offsetInSeconds > 0;
  const color = isAhead ? "bg-success" : isBehind ? "bg-warning" : "bg-primary";

  return (
    <div className="small text-secondary">
      <div className="d-flex justify-content-end gap-2">
        {isBehind && <div className="text-warning">{formatDuration(Temporal.Duration.from(offset).abs())} Behind</div>}
        {isAhead && <div className="text-success">{formatDuration(offset)} Ahead</div>}
        <div>
          {formatDuration(totalHours)} / {formatDuration(capacity)}
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

function formatDuration(duration: Temporal.Duration | string): string {
  return Temporal.Duration.from(duration)
    .toLocaleString(undefined, {
      style: "digital",
      hours: "2-digit",
      minutes: "2-digit",
    })
    .substring(0, 5);
}
