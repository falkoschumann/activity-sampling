// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { useSettings } from "../../../application/settings_service";

export default function StatisticsPage() {
  const settings = useSettings();

  async function handleOpenDataDir() {
    const result = await window.activitySampling.showOpenDialog({
      title: "Choose data directory",
      properties: ["openDirectory", "createDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return;
    }

    changeDataDir(result.filePaths[0]);
  }

  function changeDataDir(dataDir: string) {
    settings.setCurrent((prevState) => ({ ...prevState, dataDir }));
  }

  function changeCapacity(hours: number) {
    settings.setCurrent((prevState) => ({
      ...prevState,
      capacity: Temporal.Duration.from({
        hours,
      }),
    }));
  }

  return (
    <main className="container my-4">
      <form onSubmit={() => settings.store()}>
        <div className="mb-3">
          <label htmlFor="dataDirectory" className="form-label">
            Data directory
          </label>
          <div className="d-flex gap-2">
            <input
              id="dataDirectory"
              type="string"
              className="form-control"
              aria-describedby="dataDirectoryHelp"
              value={settings.current.dataDir}
              onChange={(e) => changeDataDir(e.target.value)}
            />
            <button className="btn btn-primary" type="button" onClick={handleOpenDataDir}>
              Choose...
            </button>
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
            onChange={(e) => changeCapacity(Number(e.target.value))}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>
    </main>
  );
}
