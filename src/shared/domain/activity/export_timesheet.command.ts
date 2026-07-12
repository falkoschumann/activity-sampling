// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SettingsState } from "../settings/settings.aggregate";
import {
  createTimesheetExportedEvent,
  type TimesheetExportedEvent,
} from "./timesheet_exported.event";
import { createTimesheetData } from "../value_objects/timesheet_data.value_objects";
import type { TimesheetEntry } from "../value_objects/timesheet_entry.value_object";

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
    createTimesheetData({
      ...entry,
      hours: Number(
        Temporal.Duration.from(entry.hours).total("hours").toFixed(2),
      ),
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
