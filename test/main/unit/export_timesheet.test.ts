// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { ExportTimesheetCommandHandler } from "../../../src/main/application/export_timesheet.command_handler";
import { createExportTimesheetCommand } from "../../../src/shared/domain/activity/export_timesheet.command";
import { createTimesheetExportedEvent } from "../../../src/shared/domain/activity/timesheet_exported.event";
import {
  createSettings,
  type SettingsState,
} from "../../../src/shared/domain/settings/settings.aggregate";
import { TimesheetData } from "../../../src/shared/domain/timesheet_data";
import { TimesheetEntry } from "../../../src/shared/domain/timesheet_entry";
import { SettingsProvider } from "../../../src/main/infrastructure/settings.provider";

const testSettings: SettingsState = {
  capacity: "PT32H",
  categories: ["", "Feature", "Rework", "Training"],
  firstName: "John",
  lastName: "Doe",
};

describe("Export timesheet", () => {
  describe("Export timesheet in Harvest format", () => {
    it("should export timesheet", async () => {
      const { handler, eventBus } = configure();

      const result = await handler.handle(
        createExportTimesheetCommand({
          filename: "export/null-timesheets.csv",
          timesheets: [TimesheetEntry.createTestInstance()],
        }),
      );

      expect(result).toEqual(new Success());
      expect(eventBus.getEvents()).toEqual([
        createTimesheetExportedEvent({
          filename: "export/null-timesheets.csv",
          timesheets: [TimesheetData.createTestInstance()],
        }),
      ]);
    });
  });
});

function configure() {
  const eventBus = new EventBus();
  const settingsProvider = SettingsProvider.createNull({
    readFileResponses: [createSettings(testSettings)],
  });
  const handler = ExportTimesheetCommandHandler.create({
    eventBus,
    settingsProvider,
  });
  return { handler, eventBus };
}
