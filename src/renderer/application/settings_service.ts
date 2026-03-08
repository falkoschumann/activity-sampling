// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Settings } from "../../shared/domain/settings";
import { SettingsDto } from "../../shared/infrastructure/settings";
import { Temporal } from "@js-temporal/polyfill";

export function useSettings() {
  const [dataDir, setDataDir] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [categories, setCategories] = useState("");

  async function load() {
    const dto = await window.activitySampling.loadSettings();
    const settings = SettingsDto.create(dto).validate();
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
    const dto = SettingsDto.fromModel(settings);
    await window.activitySampling.storeSettings(dto);
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
