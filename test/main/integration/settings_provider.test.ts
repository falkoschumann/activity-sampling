// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createSettings,
  createTestSettings,
} from "../../../src/main/domain/settings/settings.aggregate";
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
      createTestSettings({
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
    const settings = createTestSettings();

    await gateway.store(settings);

    expect(await gateway.load()).toEqual(createTestSettings());
  });

  it("should load configurable responses when using nullable", async () => {
    const gateway = SettingsProvider.createNull({
      readFileResponses: [createTestSettings()],
    });

    const settings = await gateway.load();

    expect(settings).toEqual(createTestSettings());
  });

  it("should track stored settings when using nullable", async () => {
    const gateway = SettingsProvider.createNull();
    const trackedStored = gateway.trackStored();

    await gateway.store(createTestSettings());

    expect(trackedStored.data).toEqual([createTestSettings()]);
  });

  it("should return default settings when using nullable", async () => {
    const gateway = SettingsProvider.createNull({
      readFileResponses: [null],
    });

    const settings = await gateway.load();

    expect(settings).toEqual(createSettings());
  });
});
