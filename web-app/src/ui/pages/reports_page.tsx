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
import { PeriodUnit, Scope } from "../../domain/activities";
import ErrorComponent from "../components/error_component";
import { formatDuration } from "../components/formatters";
import { PeriodComponent } from "../components/period_component";
import PageLayout from "../layouts/page_layout";

export default function ReportsPage() {
  const period = useSelector(selectPeriod);
  const error = useSelector(selectError);
  const dispatch = useAppDispatch();

  const scope = Scope.PROJECTS;
  useEffect(() => {
    dispatch(queryReport({ scope, ...period }));
  }, [dispatch, period, scope]);

  return (
    <PageLayout>
      <aside className="fixed-top bg-body-secondary" style={{ marginTop: "3.5rem" }}>
        <PeriodComponent
          {...period}
          units={[PeriodUnit.WEEK, PeriodUnit.MONTH, PeriodUnit.YEAR, PeriodUnit.ALL_TIME]}
          onPreviousPeriod={() => dispatch(previousPeriod({}))}
          onNextPeriod={() => dispatch(nextPeriod({}))}
          onChangePeriod={(unit) => dispatch(changePeriod({ unit }))}
        />
        <ScopeComponent scope={scope} />
      </aside>
      <main className="container my-4" style={{ paddingTop: "6.4375rem" }}>
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
      <thead className="sticky-top" style={{ top: "9.8125rem" }}>
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

function ScopeComponent({ scope }: { scope: Scope }) {
  return (
    <div className="container">
      <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with scope buttons">
        <div className="btn-group btn-group-sm">
          {Object.values(Scope).map((it) => (
            <a
              key={it}
              href="#"
              className={`btn btn-outline-secondary${scope === it ? " active" : ""}`}
              aria-current={scope === it ? "page" : undefined}
            >
              {it}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
