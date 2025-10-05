// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  Settings,
  SettingsDto,
  SettingsGateway,
} from "../../../src/main/infrastructure/settings_gateway";

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/non-existing.json",
);

const EXAMPLE_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/example.json",
);

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/settings_test.csv",
);

describe("Settings gateway", () => {
  describe("Load", () => {
    it("should return defaults when file does not exist", async () => {
      const gateway = SettingsGateway.create({ fileName: NON_EXISTING_FILE });

      const settings = await gateway.load();

      expect(settings).toEqual({});
    });

    it("should return defaults when file does not exist", async () => {
      const gateway = SettingsGateway.create({ fileName: EXAMPLE_FILE });

      const settings = await gateway.load();

      expect(settings).toEqual({ dataDir: "data" });
    });
  });

  describe("Store", () => {
    it("should store and load settings", async () => {
      const gateway = SettingsGateway.create({ fileName: TEST_FILE });
      const example: Settings = { dataDir: "test-data-dir" };

      await gateway.store(example);
      const settings = await gateway.load();

      expect(settings).toEqual(example);
    });
  });
});

describe("Settings DTO", () => {
  describe("Validate", () => {
    it("should throw a type error when DTO is not valid", () => {
      const dto = {
        dataDir: false,
      };

      expect(() => SettingsDto.fromJson(dto)).toThrow(TypeError);
    });
  });
});
