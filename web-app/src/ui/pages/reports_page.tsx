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
import { PeriodUnit } from "../../domain/activities";
import ErrorComponent from "../components/error_component";
import { formatDuration } from "../components/formatters";
import { PeriodComponent } from "../components/period_component";
import PageLayout from "../layouts/page_layout";

export default function ReportsPage() {
  const period = useSelector(selectPeriod);
  const error = useSelector(selectError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(queryReport({ scope: "projects", ...period }));
  }, [dispatch, period]);

  return (
    <PageLayout>
      <PeriodComponent
        {...period}
        units={[PeriodUnit.WEEK, PeriodUnit.MONTH, PeriodUnit.YEAR, PeriodUnit.ALL_TIME]}
        onPreviousPeriod={() => dispatch(previousPeriod())}
        onNextPeriod={() => dispatch(nextPeriod())}
        onChangePeriod={(unit) => dispatch(changePeriod({ unit }))}
      />
      <main className="container my-4" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
        <ErrorComponent {...error} />
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
            <td>{entry.client}</td>
            <td>{formatDuration(entry.hours)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
