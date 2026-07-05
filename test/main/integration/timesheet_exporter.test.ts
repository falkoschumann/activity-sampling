// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { TimesheetExporterGateway } from "../../../src/main/infrastructure/timesheet_exporter.gateway";
import {
  createTimesheetData,
  type TimesheetData,
} from "../../../src/shared/domain/timesheet_data.value_objects";
import { createTimesheetExportedEvent } from "../../../src/shared/domain/activity/timesheet_exported.event";

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-timesheets.csv",
);

const testTimesheetData: TimesheetData = {
  date: "2025-06-04",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  hours: 2,
  firstName: "",
  lastName: "",
};

describe("Timesheet exporter", () => {
  it("should export timesheet without an error", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const exporter = TimesheetExporterGateway.create();

    const event = createTimesheetExportedEvent({
      filename: TEST_FILE,
      timesheets: [createTimesheetData(testTimesheetData)],
    });
    await exporter.exportTimesheet(event);
  });

  describe("Nullable", () => {
    it("should export timesheet without an error", async () => {
      const exporter = TimesheetExporterGateway.createNull();
      const exported = exporter.trackExported();

      const event = createTimesheetExportedEvent({
        filename: "export/null-timesheets.csv",
        timesheets: [createTimesheetData(testTimesheetData)],
      });
      await exporter.exportTimesheet(event);

      expect(exported.data).toEqual<TimesheetData[][]>([
        [createTimesheetData(testTimesheetData)],
      ]);
    });
  });
});
