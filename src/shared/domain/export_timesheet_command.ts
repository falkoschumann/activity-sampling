// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimesheetEntry } from "./timesheet_query";

export class ExportTimesheetCommand {
  static create({
    timesheets,
    fileName,
  }: {
    timesheets: TimesheetEntry[];
    fileName: string;
  }): ExportTimesheetCommand {
    return new ExportTimesheetCommand(timesheets, fileName);
  }

  static createTestInstance({
    timesheets = [TimesheetEntry.createTestInstance()],
    fileName = "test-export.csv",
  }: {
    timesheets?: TimesheetEntry[];
    fileName?: string;
  } = {}): ExportTimesheetCommand {
    return ExportTimesheetCommand.create({ timesheets, fileName });
  }

  readonly timesheets: TimesheetEntry[];
  readonly fileName: string;

  private constructor(timesheets: TimesheetEntry[], fileName: string) {
    this.timesheets = timesheets.map((entry) => TimesheetEntry.create(entry));
    this.fileName = fileName;
  }
}
