// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetSettingsQueryHandler } from "../../../src/main/application/get_settings.query_handler";
import {
  createSettings,
  type SettingsState,
} from "../../../src/shared/domain/settings/settings.aggregate";
import {
  createGetSettingsQuery,
  createGetSettingsQueryResult,
  type GetSettingsQueryResult,
} from "../../../src/shared/domain/read_models/get_settings.query";

const testSettings: SettingsState = {
  capacity: "PT32H",
  categories: ["", "Feature", "Rework", "Training"],
  firstName: "John",
  lastName: "Doe",
};

const testResult: GetSettingsQueryResult = {
  capacity: "PT32H",
  categories: ["", "Feature", "Rework", "Training"],
  firstName: "John",
  lastName: "Doe",
};

describe("Get settings", () => {
  it("should return stored settings", async () => {
    const handler = GetSettingsQueryHandler.createNull({
      settings: createSettings(testSettings),
    });

    const result = await handler.handle(createGetSettingsQuery());

    expect(result).toEqual(createGetSettingsQueryResult(testResult));
  });
});
