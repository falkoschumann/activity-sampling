// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ExportTimesheetCommand } from "../../../shared/domain/logged-activity/export_timesheet.command";
import { TimesheetExportedEvent } from "./timesheet_exported.event";
import { TimesheetData } from "../timesheet_data";
import type { SettingsState } from "../settings/settings.aggregate";

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
    TimesheetExportedEvent.create({
      filename: command.data.filename,
      timesheets,
    }),
  ];
}
