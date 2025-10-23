// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Statistics, type StatisticsQuery, type StatisticsType } from "../../../../shared/domain/activities";
import { useEffect, useState } from "react";

export default function QueryParametersComponent({ onChange }: { onChange: (query: StatisticsQuery) => void }) {
  const [statistics, setStatistics] = useState<StatisticsType>(Statistics.WORKING_HOURS);
  const [ignoreSmallTasks, setIgnoreSmallTasks] = useState(false);

  useEffect(() => {
    onChange({ statistics, ignoreSmallTasks });
  }, [statistics, ignoreSmallTasks, onChange]);

  return (
    <div className="container">
      <div className="btn-toolbar py-2 gap-2" role="toolbar" aria-label="Toolbar with query parameters">
        <div className="btn-group btn-group-sm" role="group" aria-label="Option buttons">
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {statistics}
          </button>
          <ul className="dropdown-menu">
            {Object.values(Statistics).map((s) => (
              <li key={s}>
                <button className="dropdown-item" onClick={() => setStatistics(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-check">
          <input
            id="ignoreSmallTasks"
            className="form-check-input"
            type="checkbox"
            checked={ignoreSmallTasks}
            onChange={(event) => setIgnoreSmallTasks(event.target.checked)}
          />
          <label className="form-check-label" htmlFor="ignoreSmallTasks">
            Ignore small tasks
          </label>
        </div>
      </div>
    </div>
  );
}
