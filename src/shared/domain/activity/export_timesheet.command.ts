// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SettingsState } from "../settings/settings.aggregate";
import { TimesheetExportedEvent } from "./timesheet_exported.event";
import { TimesheetData } from "../timesheet_data";
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
      timesheets: timesheets.map(TimesheetEntry.create),
    };
  }
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
    TimesheetExportedEvent.create({
      filename: command.data.filename,
      timesheets,
    }),
  ];
}
