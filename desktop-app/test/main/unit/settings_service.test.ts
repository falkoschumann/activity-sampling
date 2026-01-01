// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { EventTracker } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import {
  SettingsChangedEvent,
  SettingsService,
} from "../../../src/main/application/settings_service";
import { Settings } from "../../../src/shared/domain/settings";
import { SettingsGateway } from "../../../src/main/infrastructure/settings_gateway";
import { SettingsDto } from "../../../src/shared/infrastructure/settings";

describe("Settings service", () => {
  describe("Load settings", () => {
    it("should return defaults when no settings stored", async () => {
      const { service } = configure({
        readFileResponses: [null],
      });

      const settings = await service.loadSettings();

      expect(settings).toEqual<Settings>(Settings.createDefault());
    });

    it("should return stored settings", async () => {
      const { service } = configure({
        readFileResponses: [
          SettingsDto.create({
            dataDir: "test-data",
            capacity: "PT35H",
            categories: ["test-category"],
          }),
        ],
      });

      const settings = await service.loadSettings();

      expect(settings).toEqual<Settings>(
        Settings.create({
          dataDir: "test-data",
          capacity: "PT35H",
          categories: ["test-category"],
        }),
      );
    });
  });

  describe("Store settings", () => {
    it("should store settings", async () => {
      const { service, gateway } = configure();
      const storedSettings = gateway.trackStored();

      await service.storeSettings(
        Settings.create({ dataDir: "test-data", capacity: "PT35H" }),
      );

      expect(storedSettings.data).toEqual<Settings[]>([
        Settings.create({ dataDir: "test-data", capacity: "PT35H" }),
      ]);
    });

    it("should emit event", async () => {
      const { service } = configure();
      const trackedEvents = EventTracker.create(
        service,
        SettingsChangedEvent.TYPE,
      );

      await service.storeSettings(
        Settings.create({ dataDir: "test-data", capacity: "PT35H" }),
      );

      expect(trackedEvents.events).toEqual<SettingsChangedEvent[]>([
        expect.objectContaining({
          type: SettingsChangedEvent.TYPE,
          dataDir: "test-data",
          capacity: Temporal.Duration.from("PT35H"),
        }),
      ]);
    });
  });
});

function configure({
  readFileResponses,
}: {
  readFileResponses?: (SettingsDto | null | Error)[];
} = {}) {
  const gateway = SettingsGateway.createNull({ readFileResponses });
  const service = new SettingsService(gateway);
  return { service, gateway };
}
