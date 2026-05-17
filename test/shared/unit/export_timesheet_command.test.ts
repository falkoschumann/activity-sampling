// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { ExportTimesheetCommand } from "../../../src/shared/domain/export_timesheet_command";

describe("Export timesheet command", () => {
  it("should map command", () => {
    const json = JSON.stringify(ExportTimesheetCommand.createTestInstance());
    const dto = JSON.parse(json);
    const model = ExportTimesheetCommand.create(dto);

    expect(model).toEqual<ExportTimesheetCommand>(
      ExportTimesheetCommand.createTestInstance(),
    );
  });
});
