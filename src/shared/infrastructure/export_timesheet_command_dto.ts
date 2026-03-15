// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { ExportTimesheetCommand } from "../domain/export_timesheet_command";
import { TimesheetEntryDto } from "./timesheet_query_dto";

export class ExportTimesheetCommandDto {
  static create({
    timesheets,
    fileName,
  }: {
    timesheets: TimesheetEntryDto[];
    fileName: string;
  }): ExportTimesheetCommandDto {
    return new ExportTimesheetCommandDto(timesheets, fileName);
  }

  static fromModel(model: ExportTimesheetCommand): ExportTimesheetCommandDto {
    return ExportTimesheetCommandDto.create({
      timesheets: model.timesheets.map((entry) =>
        TimesheetEntryDto.from(entry),
      ),
      fileName: model.fileName,
    });
  }

  readonly timesheets: TimesheetEntryDto[];
  readonly fileName: string;

  private constructor(timesheets: TimesheetEntryDto[], fileName: string) {
    this.timesheets = timesheets;
    this.fileName = fileName;
  }

  validate(): ExportTimesheetCommand {
    return ExportTimesheetCommand.create({
      timesheets: this.timesheets.map((dto) =>
        TimesheetEntryDto.create(dto).validate(),
      ),
      fileName: this.fileName,
    });
  }
}
