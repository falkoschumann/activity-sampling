// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import type { ExportTimesheetCommand } from "../../shared/domain/export_timesheet_command";
import {
  Timesheet,
  type TimesheetExporter,
} from "../infrastructure/timesheet_exporter";

export class ExportTimesheetCommandHandler {
  static create({
    timesheetExporter,
  }: {
    timesheetExporter: TimesheetExporter;
  }) {
    return new ExportTimesheetCommandHandler(timesheetExporter);
  }

  readonly #timesheetExporter: TimesheetExporter;

  private constructor(timesheetExporter: TimesheetExporter) {
    this.#timesheetExporter = timesheetExporter;
  }

  async handle(command: ExportTimesheetCommand): Promise<CommandStatus> {
    const timesheets = command.timesheets.map((entry) =>
      Timesheet.create({
        date: entry.date,
        client: entry.client,
        project: entry.project,
        task: entry.task,
        hours: entry.hours.total("hours"),
        firstName: "",
        lastName: "",
      }),
    );
    await this.#timesheetExporter.exportTimesheet(timesheets, command.fileName);
    return new Success();
  }
}
