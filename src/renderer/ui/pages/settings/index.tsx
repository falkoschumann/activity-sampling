// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { FormEvent } from "react";

import { useSettings } from "../../../application/settings_service";

export default function SettingsPage() {
  const settings = useSettings();

  async function handleOpenDataDir() {
    const result = await window.activitySampling.showOpenDialog({
      title: "Choose data directory",
      properties: ["openDirectory", "createDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return;
    }

    settings.setDataDir(result.filePaths[0]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await settings.store();
  }

  return (
    <main className="container my-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="dataDir" className="form-label">
            Data directory
          </label>
          <div className="d-flex gap-2">
            <input
              id="dataDir"
              type="string"
              className="form-control"
              value={settings.dataDir}
              onChange={(e) => settings.setDataDir(e.target.value)}
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
            value={settings.capacity}
            onChange={(e) => settings.setCapacity(Number(e.target.value))}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="categories" className="form-label">
            Categories
          </label>
          <input
            id="categories"
            type="text"
            className="form-control"
            value={settings.categories}
            onChange={(e) => settings.setCategories(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>
    </main>
  );
}
