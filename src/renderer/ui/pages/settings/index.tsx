// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type SubmitEvent, useState } from "react";

import { SettingsQueryResult } from "../../../../shared/domain/settings_query";
import { UpdateSettingsCommand } from "../../../../shared/domain/update_settings_command";
import { useMessageHandler } from "../../components/message_handler_context";

export default function SettingsPage() {
  const [result, setResult] = useState(SettingsQueryResult.create());
  const [dataDir, setDataDir] = useState(result.dataDir);
  const [capacity, setCapacity] = useState(result.capacity.total("hours"));
  const [categories, setCategories] = useState(result.categories);
  const messageHandler = useMessageHandler();

  async function handleOpenDataDir() {
    const { canceled, filePaths } = await window.activitySampling.showOpenDialog({
      title: "Choose data directory",
      properties: ["openDirectory", "createDirectory"],
    });

    if (canceled || filePaths.length === 0) {
      return;
    }

    setResult({ ...result, dataDir: filePaths[0] });
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await messageHandler.updateSettings(
      UpdateSettingsCommand.create({
        dataDir,
        capacity: Temporal.Duration.from({ hours: capacity }),
        categories,
      }),
    );
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
              value={dataDir}
              onChange={(e) => setDataDir(e.target.value)}
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
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
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
            value={categories}
            onChange={(e) => setCategories(e.target.value.split(",").map((c) => c.trim()))}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>
    </main>
  );
}
