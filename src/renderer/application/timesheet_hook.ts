// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createCommandStatus } from "@muspellheim/shared";
import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import type { ExportTimesheetCommand } from "../../shared/domain/export_timesheet_command";
import {
  type TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";

export function useTimesheet(query: TimesheetQuery) {
  const [result, setResult] = useState(TimesheetQueryResult.create());

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
  let json = JSON.stringify(query);
  json = await window.activitySampling.queryTimesheet(json);
  const dto = JSON.parse(json);
  return TimesheetQueryResult.create(dto);
}

async function exportTimesheet(command: ExportTimesheetCommand) {
  let json = JSON.stringify(command);
  json = await window.activitySampling.exportTimesheet(json);
  const dto = JSON.parse(json);
  return createCommandStatus(dto);
}
