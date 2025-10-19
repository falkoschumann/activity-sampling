// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Settings } from "../../../../shared/domain/settings";
import { SettingsDto } from "../../../../shared/infrastructure/settings";
import { Temporal } from "@js-temporal/polyfill";

export default function StatisticsPage() {
  const [settings, setSettings] = useState(Settings.createDefault());

  async function handleSubmit() {
    const dto = SettingsDto.fromModel(settings);
    await window.activitySampling.storeSettings(dto);
  }

  useEffect(() => {
    (async () => {
      const dto = await window.activitySampling.loadSettings();
      setSettings(SettingsDto.create(dto).validate());
    })();
  }, []);

  return (
    <main className="container my-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="dataDirectory" className="form-label">
            Data directory
          </label>
          <input
            id="dataDirectory"
            type="string"
            className="form-control"
            aria-describedby="dataDirectoryHelp"
            value={settings?.dataDir}
            onChange={(e) => {
              setSettings(
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
            value={settings?.capacity.total("hours")}
            onChange={(e) => {
              setSettings(
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
