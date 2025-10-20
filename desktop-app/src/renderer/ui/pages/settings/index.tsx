// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { useSettings } from "../../../application/settings_service";
import { Settings } from "../../../../shared/domain/settings";

export default function StatisticsPage() {
  const settings = useSettings();

  return (
    <main className="container my-4">
      <form onSubmit={() => settings.store()}>
        <div className="mb-3">
          <label htmlFor="dataDirectory" className="form-label">
            Data directory
          </label>
          <input
            id="dataDirectory"
            type="string"
            className="form-control"
            aria-describedby="dataDirectoryHelp"
            value={settings.current.dataDir}
            onChange={(e) => {
              settings.setCurrent(
                (prevState) =>
                  ({ ...prevState, dataDir: e.target.value }) as Settings,
              );
            }}
          />
          <div id="dataDirectoryHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="capacity" className="form-label">
            Capacity in hours per week
          </label>
          <input
            id="capacity"
            type="number"
            className="form-control"
            value={settings.current.capacity.total("hours")}
            onChange={(e) => {
              settings.setCurrent(
                (prevState) =>
                  ({
                    ...prevState,
                    capacity: Temporal.Duration.from({
                      hours: Number(e.target.value),
                    }),
                  }) as Settings,
              );
            }}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>
    </main>
  );
}
