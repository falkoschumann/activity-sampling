// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Settings } from "../../shared/domain/settings";
import { SettingsDto } from "../../shared/infrastructure/settings";

export function useSettings() {
  const [current, setCurrent] = useState(Settings.createDefault());

  async function load() {
    const dto = await window.activitySampling.loadSettings();
    setCurrent(SettingsDto.create(dto).validate());
  }

  async function store() {
    const dto = SettingsDto.fromModel(current);
    await window.activitySampling.storeSettings(dto);
  }

  useEffect(() => {
    (() => load())();
  }, []);

  return { current, setCurrent, store };
}
