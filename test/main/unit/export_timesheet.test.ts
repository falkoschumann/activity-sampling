// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { exportTimesheet } from "../../../src/main/application/export_timesheet";
import { ExportTimesheetCommand } from "../../../src/shared/domain/export_timesheet_command";
import {
  TimesheetDto,
  TimesheetExporter,
} from "../../../src/main/infrastructure/timesheet_exporter";
import { TimesheetEntry } from "../../../src/shared/domain/activities";

describe("Export timesheet", () => {
  describe("Export timesheet in Harvest format", () => {
    it("should export timesheet", async () => {
      const timesheetExporter = TimesheetExporter.createNull();
      const exported = timesheetExporter.trackExported();

      const timesheets = [TimesheetEntry.createTestInstance()];
      const fileName = "export/null-timesheets.csv";
      const command = ExportTimesheetCommand.create({ timesheets, fileName });
      const result = await exportTimesheet(command, timesheetExporter);

      expect(result).toEqual(new Success());
      expect(exported.data).toEqual<TimesheetDto[][]>([
        [TimesheetDto.createTestInstance({ firstName: "", lastName: "" })],
      ]);
    });
  });
});
