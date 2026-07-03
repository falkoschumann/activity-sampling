// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SettingsState } from "../settings/settings.aggregate";
import {
  createTimesheetExportedEvent,
  type TimesheetExportedEvent,
} from "./timesheet_exported.event";
import { TimesheetData } from "../timesheet_data";
import { TimesheetEntry } from "../timesheet_entry";

export interface ExportTimesheetCommand {
  readonly type: "export-timesheet";
  readonly data: ExportTimesheetCommandData;
}

export type ExportTimesheetCommandData = Readonly<{
  filename: string;
  timesheets: TimesheetEntry[];
}>;

export function createExportTimesheetCommand({
  filename,
  timesheets,
}: {
  filename: string;
  timesheets: TimesheetEntry[];
}): ExportTimesheetCommand {
  return {
    type: "export-timesheet",
    data: { filename, timesheets },
  };
}

export function exportTimesheet(
  settings: SettingsState,
  command: ExportTimesheetCommand,
): TimesheetExportedEvent[] {
  const timesheets = command.data.timesheets.map((entry) =>
    TimesheetData.create({
      ...entry,
      hours: entry.hours.total("hours"),
      firstName: settings.firstName ?? "",
      lastName: settings.lastName ?? "",
    }),
  );
  return [
    createTimesheetExportedEvent({
      filename: command.data.filename,
      timesheets,
    }),
  ];
}
