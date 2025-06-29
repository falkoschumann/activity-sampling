// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { PeriodUnit } from "../../domain/activities";
import { formatDate } from "./formatters";

export function PeriodComponent({
  from,
  to,
  unit,
  units,
  onPreviousPeriod,
  onNextPeriod,
  onChangePeriod,
}: {
  from: string;
  to: string;
  unit: PeriodUnit;
  units: PeriodUnit[];
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onChangePeriod: (unit: PeriodUnit) => void;
}) {
  // TODO store parameters in URL query
  // TODO distinct between "this month" and "month", same for other units
  // TODO add return to "this month" button when period is not this month, same for other units
  // TODO when change unit, reset to this period
  // TODO add custom period
  return (
    <aside className="fixed-top bg-body-secondary" style={{ marginTop: "3.5rem" }}>
      <div className="container">
        <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with navigation buttons">
          {unit === "All time" ? (
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
                <strong>{unit}:</strong> {formatDate(from)} - {formatDate(to)}
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
