// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { queryReport, selectEntries } from "../../application/reports_slice";
import { AppDispatch } from "../../application/store";
import { formatDuration } from "../components/formatters";
import PageLayout from "../layouts/page_layout";

export default function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryReport({ scope: "projects", from: "2025-06-01", to: "2025-06-30" }));
  }, [dispatch]);

  return (
    <PageLayout>
      <main className="container my-4">
        <TimeReportContainer />
      </main>
    </PageLayout>
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
