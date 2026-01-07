// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimesheetEntry } from "./activities";

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

  readonly timesheets: TimesheetEntry[];
  readonly fileName: string;

  private constructor(timesheets: TimesheetEntry[], fileName: string) {
    this.timesheets = timesheets;
    this.fileName = fileName;
  }
}
