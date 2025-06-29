// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  changePeriod,
  nextPeriod,
  previousPeriod,
  queryReport,
  selectEntries,
  selectError,
  selectPeriod,
} from "../../application/reports_slice";
import { useAppDispatch } from "../../application/store";
import ErrorComponent from "../components/error_component";
import { formatDate, formatDuration } from "../components/formatters";
import PageLayout from "../layouts/page_layout";

export default function ReportsPage() {
  const error = useSelector(selectError);
  return (
    <PageLayout>
      <PeriodContainer />
      <main className="container my-4" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
        <ErrorComponent {...error} />
        <TimeReportContainer />
      </main>
    </PageLayout>
  );
}

function PeriodContainer() {
  const { from, to, unit } = useSelector(selectPeriod);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(queryReport({ scope: "projects", from, to }));
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
              <strong>This {unit}:</strong> {formatDate(from)} - {formatDate(to)}
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

function TimeReportContainer() {
  const entries = useSelector(selectEntries);

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Client</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr key={index}>
            <td className="text-nowrap">{entry.name}</td>
            <td className="text-nowrap">{entry.client}</td>
            <td>{formatDuration(entry.hours)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
