// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { formatDate } from "../../../shared/common/temporal";
import { PeriodUnit, type PeriodUnitType } from "../../domain/period";

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
  from: Temporal.PlainDate;
  to: Temporal.PlainDate;
  unit: PeriodUnitType;
  isCurrent: boolean;
  units: PeriodUnitType[];
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onChangePeriod: (unit: PeriodUnitType) => void;
}) {
  return (
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
            {(unit === PeriodUnit.WEEK ||
              unit === PeriodUnit.MONTH ||
              unit === PeriodUnit.QUARTER ||
              unit === PeriodUnit.HALF_YEAR) &&
              " - " + formatDate(to)}
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
  );
}
