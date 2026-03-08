// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import type { ExportTimesheetCommand } from "../../shared/domain/export_timesheet_command";
import {
  TimesheetDto,
  type TimesheetExporter,
} from "../infrastructure/timesheet_exporter";

export async function exportTimesheet(
  command: ExportTimesheetCommand,
  timesheetExporter: TimesheetExporter,
): Promise<CommandStatus> {
  const timesheets = command.timesheets.map((entry) =>
    TimesheetDto.create({
      date: entry.date.toString(),
      client: entry.client,
      project: entry.project,
      task: entry.task,
      hours: entry.hours.total("hours"),
      firstName: "",
      lastName: "",
    }),
  );
  await timesheetExporter.exportTimesheet(timesheets, command.fileName);
  return new Success();
}
