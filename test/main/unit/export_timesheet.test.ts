// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { ExportTimesheetCommandHandler } from "../../../src/main/application/export_timesheet_command_handler";
import { ExportTimesheetCommand } from "../../../src/shared/domain/export_timesheet_command";
import {
  Timesheet,
  TimesheetExporter,
} from "../../../src/main/infrastructure/timesheet_exporter";
import { TimesheetEntry } from "../../../src/shared/domain/timesheet_query";

describe("Export timesheet", () => {
  describe("Export timesheet in Harvest format", () => {
    it("should export timesheet", async () => {
      const { handler, timesheetExporter } = configure();
      const exported = timesheetExporter.trackExported();

      const result = await handler.handle(
        ExportTimesheetCommand.create({
          timesheets: [TimesheetEntry.createTestInstance()],
          fileName: "export/null-timesheets.csv",
        }),
      );

      expect(result).toEqual(new Success());
      expect(exported.data).toEqual<Timesheet[][]>([
        [Timesheet.createTestInstance({ firstName: "", lastName: "" })],
      ]);
    });
  });
});

function configure() {
  const timesheetExporter = TimesheetExporter.createNull();
  const handler = ExportTimesheetCommandHandler.create({ timesheetExporter });
  return { handler, timesheetExporter };
}
