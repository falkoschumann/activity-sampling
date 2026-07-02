// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { ChangeSettingsCommandHandler } from "../../../src/main/application/change_settings.command_handler";
import {
  createSettings,
  type SettingsState,
} from "../../../src/shared/domain/settings/settings.aggregate";
import { createChangeSettingsCommand } from "../../../src/shared/domain/settings/change_settings.command";
import { createSettingsChangedEvent } from "../../../src/shared/domain/settings/settings_changed.event";
import { SettingsProvider } from "../../../src/main/infrastructure/settings.provider";

const fullSettings: SettingsState = {
  capacity: "PT32H",
  categories: ["", "Feature", "Rework", "Training"],
  firstName: "John",
  lastName: "Doe",
};

describe("Change settings", () => {
  it("should change settings", async () => {
    const { handler, eventBus, settingsProvider } = configure();
    const trackedStored = settingsProvider.trackStored();

    const status = await handler.handle(
      createChangeSettingsCommand(fullSettings),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      createSettingsChangedEvent(fullSettings),
    ]);
    expect(trackedStored.data).toEqual([createSettings(fullSettings)]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const settingsProvider = SettingsProvider.createNull();
  const handler = ChangeSettingsCommandHandler.create({
    eventBus,
    settingsProvider,
  });
  return { handler, eventBus, settingsProvider };
}
