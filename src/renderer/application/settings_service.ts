// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import { Settings } from "../../shared/domain/settings";

export function useSettings() {
  const [dataDir, setDataDir] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [categories, setCategories] = useState("");

  async function load() {
    const json = await window.activitySampling.loadSettings();
    const dto = JSON.parse(json);
    const settings = Settings.create(dto);
    setDataDir(settings.dataDir);
    setCapacity(settings.capacity.total("hours"));
    setCategories(settings.categories.join(", "));
  }

  async function store() {
    const settings = Settings.create({
      dataDir,
      capacity: Temporal.Duration.from({ hours: capacity }),
      categories: categories.split(",").map((c) => c.trim()),
    });
    const json = JSON.stringify(settings);
    await window.activitySampling.storeSettings(json);
  }

  useEffect(() => {
    (() => load())();
  }, []);

  return {
    dataDir,
    setDataDir,
    capacity,
    setCapacity,
    categories,
    setCategories,
    store,
  };
}
