// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { StatisticsScope, type StatisticsScopeType } from "../../../../shared/domain/statistics_query";

export default function ScopeComponent({
  value,
  onChange,
}: {
  value: StatisticsScopeType;
  onChange: (scope: StatisticsScopeType) => void;
}) {
  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Select scope">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {value}
      </button>
      <ul className="dropdown-menu">
        {Object.values(StatisticsScope).map((s) => (
          <li key={s}>
            <button className="dropdown-item" onClick={() => onChange(s)}>
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
