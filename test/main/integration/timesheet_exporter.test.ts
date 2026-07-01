// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { TimesheetExporterGateway } from "../../../src/main/infrastructure/timesheet_exporter.gateway";
import { TimesheetData } from "../../../src/main/domain/timesheet_data";
import { TimesheetExportedEvent } from "../../../src/main/domain/logged-activity/timesheet_exported.event";

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-timesheets.csv",
);

describe("Timesheet exporter", () => {
  it("should export timesheet without an error", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const exporter = TimesheetExporterGateway.create();

    const event = TimesheetExportedEvent.create({
      filename: TEST_FILE,
      timesheets: [TimesheetData.createTestInstance()],
    });
    await exporter.exportTimesheet(event);
  });

  describe("Nullable", () => {
    it("should export timesheet without an error", async () => {
      const exporter = TimesheetExporterGateway.createNull();
      const exported = exporter.trackExported();

      const event = TimesheetExportedEvent.create({
        filename: "export/null-timesheets.csv",
        timesheets: [TimesheetData.createTestInstance()],
      });
      await exporter.exportTimesheet(event);

      expect(exported.data).toEqual<TimesheetData[][]>([
        [TimesheetData.createTestInstance()],
      ]);
    });
  });
});
