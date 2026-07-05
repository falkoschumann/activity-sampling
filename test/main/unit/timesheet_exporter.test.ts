// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { TimesheetExportEventHandler } from "../../../src/main/application/timesheet_exporter.event_handler";
import { createTimesheetExportedEvent } from "../../../src/shared/domain/activity/timesheet_exported.event";
import {
  createTimesheetData,
  type TimesheetData,
} from "../../../src/shared/domain/value_objects/timesheet_data.value_objects";
import { TimesheetExporterGateway } from "../../../src/main/infrastructure/timesheet_exporter.gateway";

const testTimesheetData: TimesheetData = {
  date: "2025-06-04",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  hours: 2,
  firstName: "",
  lastName: "",
};

describe("Export timesheet", () => {
  describe("Export timesheet in Harvest format", () => {
    it("should export timesheet", async () => {
      const { eventBus, timesheetExporterGateway } = configure();
      const exported = timesheetExporterGateway.trackExported();

      eventBus.publish(
        createTimesheetExportedEvent({
          filename: "export/null-timesheets.csv",
          timesheets: [createTimesheetData(testTimesheetData)],
        }),
      );

      await expect
        .poll(() => exported.data)
        .toEqual([[createTimesheetData(testTimesheetData)]]);
    });
  });
});

function configure() {
  const eventBus = new EventBus();
  const timesheetExporterGateway = TimesheetExporterGateway.createNull();
  const handler = TimesheetExportEventHandler.create({
    eventBus,
    timesheetExporterGateway,
  });
  return { handler, eventBus, timesheetExporterGateway };
}
