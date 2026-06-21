// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { TimesheetExportEventHandler } from "../../../src/main/application/timesheet_exporter.event_handler";
import { TimesheetExportedEvent } from "../../../src/main/domain/logged-activity/timesheet_exported.event";
import { TimesheetData } from "../../../src/main/domain/timesheet_data";
import { TimesheetExporterGateway } from "../../../src/main/infrastructure/timesheet_exporter.gateway";

describe("Export timesheet", () => {
  describe("Export timesheet in Harvest format", () => {
    it("should export timesheet", async () => {
      const { eventBus, timesheetExporter } = configure();
      const exported = timesheetExporter.trackExported();

      eventBus.publish(
        TimesheetExportedEvent.create({
          filename: "export/null-timesheets.csv",
          timesheets: [
            {
              ...TimesheetData.createTestInstance(),
              firstName: "",
              lastName: "",
            },
          ],
        }),
      );

      await expect
        .poll(() => exported.data)
        .toEqual([
          [TimesheetData.createTestInstance({ firstName: "", lastName: "" })],
        ]);
    });
  });
});

function configure() {
  const eventBus = new EventBus();
  const timesheetExporter = TimesheetExporterGateway.createNull();
  const handler = TimesheetExportEventHandler.create({
    eventBus,
    timesheetExporter,
  });
  return { handler, eventBus, timesheetExporter };
}
