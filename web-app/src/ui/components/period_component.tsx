// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { PeriodUnit } from "../../domain/activities";
import { formatDate } from "./formatters";

export function PeriodComponent({
  from,
  to,
  unit,
  isCurrent,
  units,
  onPreviousPeriod,
  onNextPeriod,
  onChangePeriod,
}: {
  from: string;
  to: string;
  unit: PeriodUnit;
  isCurrent: boolean;
  units: PeriodUnit[];
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onChangePeriod: (unit: PeriodUnit) => void;
}) {
  return (
    <aside className="fixed-top bg-body-secondary" style={{ marginTop: "3.5rem" }}>
      <div className="container">
        <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with navigation buttons">
          {unit === PeriodUnit.ALL_TIME ? (
            <div className="align-content-center">
              <strong>{unit}</strong>
            </div>
          ) : (
            <div className="btn-group btn-group-sm" role="group" aria-label="Navigation buttons">
              <button type="button" className="btn" onClick={() => onPreviousPeriod()}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button type="button" className="btn" onClick={() => onNextPeriod()}>
                <i className="bi bi-chevron-right"></i>
              </button>
              <div className="align-content-center">
                <strong>
                  {isCurrent && "This "}
                  {unit}:
                </strong>{" "}
                {unit === PeriodUnit.YEAR ? Temporal.PlainDate.from(from).year : formatDate(from)}
                {(unit === PeriodUnit.WEEK || unit === PeriodUnit.MONTH) && " - " + formatDate(to)}
              </div>
            </div>
          )}
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
              {units.map((unit) => (
                <li key={unit}>
                  <button className="dropdown-item" onClick={() => onChangePeriod(unit)}>
                    {unit}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
