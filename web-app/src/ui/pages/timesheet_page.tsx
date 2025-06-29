// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { selectError } from "../../application/log_slice";
import { useAppDispatch } from "../../application/store";
import {
  changePeriod,
  nextPeriod,
  previousPeriod,
  queryTimesheet,
  selectEntries,
  selectPeriod,
  selectWorkingHoursSummary,
} from "../../application/timesheet_slice";
import { PeriodUnit } from "../../domain/activities";
import ErrorComponent from "../components/error_component";
import { formatDate, formatDuration } from "../components/formatters";
import { PeriodComponent } from "../components/period_component";
import PageLayout from "../layouts/page_layout";

export default function TimesheetPage() {
  const period = useSelector(selectPeriod);
  const error = useSelector(selectError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(queryTimesheet({ ...period }));
  }, [dispatch, period]);

  return (
    <PageLayout>
      <PeriodComponent
        {...period}
        units={[PeriodUnit.DAY, PeriodUnit.WEEK, PeriodUnit.MONTH]}
        onPreviousPeriod={() => dispatch(previousPeriod({}))}
        onNextPeriod={() => dispatch(nextPeriod({}))}
        onChangePeriod={(unit) => dispatch(changePeriod({ unit }))}
      />
      <main className="container my-4" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
        <ErrorComponent {...error} />
        <TimesheetContainer />
      </main>
      <footer className="fixed-bottom bg-body">
        <div className="container py-2">
          <CapacityContainer />
        </div>
      </footer>
    </PageLayout>
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
            <td>{formatDate(entry.date)}</td>
            <td className="text-nowrap">{entry.client}</td>
            <td className="text-nowrap">{entry.project}</td>
            <td>
              {entry.task}
              <button
                type="button"
                className="btn btn-sm"
                title="Copy task name."
                onClick={() => navigator.clipboard.writeText(entry.task)}
              >
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

function CapacityContainer() {
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
