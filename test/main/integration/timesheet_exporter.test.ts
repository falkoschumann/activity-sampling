// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  Timesheet,
  TimesheetExporter,
} from "../../../src/main/infrastructure/timesheet_exporter";

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-timesheets.csv",
);

describe("Timesheet export", () => {
  it("should export timesheet without an error", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const exporter = TimesheetExporter.create();

    const timesheets = [Timesheet.createTestInstance()];
    await exporter.exportTimesheet(timesheets, TEST_FILE);
  });

  describe("Nullable", () => {
    it("should export timesheet without an error", async () => {
      const exporter = TimesheetExporter.createNull();
      const exported = exporter.trackExported();

      const timesheets = [Timesheet.createTestInstance()];
      const fileName = "export/null-timesheets.csv";
      await exporter.exportTimesheet(timesheets, fileName);

      expect(exported.data).toEqual<Timesheet[][]>([
        [Timesheet.createTestInstance()],
      ]);
    });
  });
});
