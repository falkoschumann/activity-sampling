// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectError } from "../../application/log_slice";
import { AppDispatch } from "../../application/store";
import {
  changePeriod,
  nextPeriod,
  previousPeriod,
  queryTimesheet,
  selectEntries,
  selectPeriod,
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
  const { from, to, unit } = useSelector(selectPeriod);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryTimesheet({ from, to }));
  }, [dispatch, from, to]);

  return (
    <aside className="fixed-top bg-body-secondary" style={{ marginTop: "3.5rem" }}>
      <div className="container">
        <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with navigation buttons">
          <div className="btn-group btn-group-sm" role="group" aria-label="Navigation buttons">
            <button type="button" className="btn" onClick={() => dispatch(previousPeriod())}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <button type="button" className="btn" onClick={() => dispatch(nextPeriod())}>
              <i className="bi bi-chevron-right"></i>
            </button>
            <div className="align-content-center">
              <strong>This {unit}:</strong>{" "}
              {Temporal.PlainDate.from(from).toLocaleString(undefined, {
                dateStyle: "medium",
              })}{" "}
              - {Temporal.PlainDate.from(to).toLocaleString(undefined, { dateStyle: "medium" })}
            </div>
          </div>
          <div className="btn-group btn-group-sm ms-auto" role="group" aria-label="Option buttons">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {unit}
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => dispatch(changePeriod({ unit: "Day" }))}>
                  Day
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => dispatch(changePeriod({ unit: "Week" }))}>
                  Week
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => dispatch(changePeriod({ unit: "Month" }))}>
                  Month
                </button>
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
            <td>{Temporal.PlainDate.from(entry.date).toLocaleString(undefined, { dateStyle: "medium" })}</td>
            <td className="text-nowrap">{entry.client}</td>
            <td className="text-nowrap">{entry.project}</td>
            <td>
              {entry.task}
              <button type="button" className="btn btn-sm" onClick={() => navigator.clipboard.writeText(entry.task)}>
                <i className="bi bi-copy"></i>
              </button>
            </td>
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
    .slice(0, -3); // Remove seconds for a cleaner display
}
