// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createSettings,
  type SettingsState,
} from "../../../src/shared/domain/settings/settings.aggregate";
import { SettingsProvider } from "../../../src/main/infrastructure/settings.provider";

const MINIMAL_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/minimal.json",
);

const FULL_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/full.json",
);

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/non-existing.json",
);

const CORRUPT_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/corrupt.json",
);

const INVALID_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/invalid.json",
);

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-settings.csv",
);

const testSettings: SettingsState = {
  capacity: "PT32H",
  categories: ["", "Feature", "Rework", "Training"],
  firstName: "John",
  lastName: "Doe",
};

describe("Settings provider", () => {
  it("should load minimal example", async () => {
    const gateway = SettingsProvider.create({ filename: MINIMAL_FILE });

    const settings = await gateway.load();

    expect(settings).toEqual(
      createSettings({
        capacity: "PT32H",
        categories: ["", "Feature", "Rework", "Training"],
      }),
    );
  });

  it("should load full example", async () => {
    const gateway = SettingsProvider.create({ filename: FULL_FILE });

    const settings = await gateway.load();

    expect(settings).toEqual(
      createSettings({
        ...testSettings,
        firstName: "John",
        lastName: "Doe",
      }),
    );
  });

  it("should return default settings when file does not exist", async () => {
    const gateway = SettingsProvider.create({ filename: NON_EXISTING_FILE });

    const settings = await gateway.load();

    expect(settings).toEqual(createSettings());
  });

  it("should throw an error when the file is corrupted", async () => {
    const gateway = SettingsProvider.create({ filename: CORRUPT_FILE });

    const result = gateway.load();

    await expect(result).rejects.toThrow(SyntaxError);
  });

  it("should throw an error when the file is invalid", async () => {
    const gateway = SettingsProvider.create({ filename: INVALID_FILE });

    const result = gateway.load();

    await expect(result).rejects.toThrow(TypeError);
  });

  it("should load stored settings", async () => {
    const gateway = SettingsProvider.create({ filename: TEST_FILE });
    const settings = createSettings(testSettings);

    await gateway.store(settings);

    expect(await gateway.load()).toEqual(createSettings(testSettings));
  });

  it("should load configurable responses when using nullable", async () => {
    const gateway = SettingsProvider.createNull({
      readFileResponses: [createSettings(testSettings)],
    });

    const settings = await gateway.load();

    expect(settings).toEqual(createSettings(testSettings));
  });

  it("should track stored settings when using nullable", async () => {
    const gateway = SettingsProvider.createNull();
    const trackedStored = gateway.trackStored();

    await gateway.store(createSettings(testSettings));

    expect(trackedStored.data).toEqual([createSettings(testSettings)]);
  });

  it("should return default settings when using nullable", async () => {
    const gateway = SettingsProvider.createNull({
      readFileResponses: [null],
    });

    const settings = await gateway.load();

    expect(settings).toEqual(createSettings());
  });
});
