// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import type { ExportTimesheetCommand } from "../../shared/domain/export_timesheet_command";
import {
  type TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import {
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../../shared/infrastructure/timesheet_query_dto";
import { ExportTimesheetCommandDto } from "../../shared/infrastructure/export_timesheet_command_dto";
import { CommandStatusDto } from "../../shared/infrastructure/command_status_dto";

export function useTimesheet(query: TimesheetQuery) {
  const [result, setResult] = useState(TimesheetQueryResult.empty());

  useEffect(() => {
    (async function () {
      const result = await queryTimesheet({
        from: Temporal.PlainDate.from(query.from),
        to: Temporal.PlainDate.from(query.to),
      });
      setResult(result);
    })();
  }, [query.from, query.to]);

  return {
    timesheet: result,
    exportTimesheet,
  };
}

async function queryTimesheet(query: TimesheetQuery) {
  const resultDto = await window.activitySampling.queryTimesheet(
    TimesheetQueryDto.fromModel(query),
  );
  return TimesheetQueryResultDto.create(resultDto).validate();
}

async function exportTimesheet(command: ExportTimesheetCommand) {
  const statusDto = await window.activitySampling.exportTimesheet(
    ExportTimesheetCommandDto.fromModel(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}
