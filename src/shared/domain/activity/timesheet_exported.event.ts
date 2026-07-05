// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimesheetData } from "../value_objects/timesheet_data.value_objects";

export interface TimesheetExportedEvent {
  readonly type: "timesheet-exported";
  readonly data: TimesheetExportedEventData;
}

export type TimesheetExportedEventData = Readonly<{
  filename: string;
  timesheets: TimesheetData[];
}>;

export function createTimesheetExportedEvent({
  filename,
  timesheets,
}: {
  filename: string;
  timesheets: TimesheetData[];
}): TimesheetExportedEvent {
  return {
    type: "timesheet-exported",
    data: { filename, timesheets },
  };
}
