// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { describe, expect, it } from "vitest";

import { Settings } from "../../../src/main/domain/settings";
import {
  SettingsDto,
  SettingsGateway,
} from "../../../src/main/infrastructure/settings_gateway";
import { Temporal } from "@js-temporal/polyfill";

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/non-existing.json",
);

const FULL_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/full.json",
);

const MINIMAL_FILE = path.resolve(
  import.meta.dirname,
  "../data/settings/minimal.json",
);

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-settings.csv",
);

describe("Settings gateway", () => {
  describe("Load", () => {
    it("should return nothing when file does not exist", async () => {
      const gateway = SettingsGateway.create({ fileName: NON_EXISTING_FILE });

      const settings = await gateway.load();

      expect(settings).toBeUndefined();
    });

    it("should return full example file", async () => {
      const gateway = SettingsGateway.create({ fileName: FULL_FILE });

      const settings = await gateway.load();

      expect(settings).toEqual<Settings>(
        Settings.create({
          dataDir: "other-data",
          capacity: Temporal.Duration.from("PT20H"),
        }),
      );
    });

    it("should return full minimal file", async () => {
      const gateway = SettingsGateway.create({ fileName: MINIMAL_FILE });

      const settings = await gateway.load();

      expect(settings).toEqual<Settings>(
        Settings.create({
          dataDir: "other-data",
          capacity: Temporal.Duration.from("PT40H"),
        }),
      );
    });
  });

  describe("Store", () => {
    it("should store and load settings", async () => {
      const gateway = SettingsGateway.create({ fileName: TEST_FILE });
      const example = Settings.create({
        dataDir: "test-data-dir",
        capacity: Temporal.Duration.from("PT35H"),
      });

      await gateway.store(example);
      const settings = await gateway.load();

      expect(settings).toEqual<Settings>(example);
    });
  });

  describe("Nullable", () => {
    describe("Load", () => {
      it("should return default when configurable response is null", async () => {
        const gateway = SettingsGateway.createNull({
          readFileResponses: [null],
        });

        const settings = await gateway.load();

        expect(settings).toBeUndefined();
      });

      it("should return configurable responses", async () => {
        const gateway = SettingsGateway.createNull({
          readFileResponses: [
            SettingsDto.create({ dataDir: "data-dir", capacity: "PT40H" }),
          ],
        });

        const settings = await gateway.load();

        expect(settings).toEqual<Settings>(
          Settings.create({ dataDir: "data-dir", capacity: "PT40H" }),
        );
      });

      it("should throw an error when configurable response is an error", async () => {
        const gateway = SettingsGateway.createNull({
          readFileResponses: [new Error("Test error")],
        });

        const settings = gateway.load();

        await expect(settings).rejects.toThrow("Test error");
      });
    });

    describe("Store", () => {
      it("should store settings", async () => {
        const gateway = SettingsGateway.createNull();
        const storedSettings = gateway.trackStored();

        await gateway.store(
          Settings.create({ dataDir: "data-dir", capacity: "PT40H" }),
        );

        expect(storedSettings.data).toEqual<Settings[]>([
          Settings.create({ dataDir: "data-dir", capacity: "PT40H" }),
        ]);
      });
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
