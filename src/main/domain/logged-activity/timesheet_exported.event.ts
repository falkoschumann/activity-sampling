// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetData } from "../timesheet_data";

export class TimesheetExportedEvent {
  static create({
    filename,
    timesheets,
  }: {
    filename: string;
    timesheets: TimesheetData[];
  }) {
    return new TimesheetExportedEvent(filename, timesheets);
  }

  readonly type = "timesheet-exported";
  readonly data;

  private constructor(filename: string, timesheets: TimesheetData[]) {
    this.data = { filename, timesheets };
  }
}
