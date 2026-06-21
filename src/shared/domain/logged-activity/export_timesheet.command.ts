// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimesheetEntry } from "../timesheet_entry";

export class ExportTimesheetCommand {
  static create({
    filename,
    timesheets,
  }: {
    filename: string;
    timesheets: TimesheetEntry[];
  }) {
    return new ExportTimesheetCommand(filename, timesheets);
  }

  static createTestInstance({
    filename = "test-export.csv",
    timesheets = [TimesheetEntry.createTestInstance()],
  }: {
    filename?: string;
    timesheets?: TimesheetEntry[];
  } = {}) {
    return ExportTimesheetCommand.create({
      filename,
      timesheets,
    });
  }

  readonly type = "export-timesheet";
  readonly data;

  private constructor(filename: string, timesheets: TimesheetEntry[]) {
    this.data = {
      filename,
      timesheets: timesheets.map((entry) => TimesheetEntry.create(entry)),
    };
  }
}
