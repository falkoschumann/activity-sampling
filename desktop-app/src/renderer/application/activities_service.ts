// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  LogActivityCommand,
  RecentActivitiesQuery,
  ReportQuery,
  TimesheetQuery,
} from "../../shared/domain/activities";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../../shared/infrastructure/activities";

export async function logActivity(command: LogActivityCommand) {
  const statusDto = await window.activitySampling.logActivity(
    LogActivityCommandDto.fromModel(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}

export async function queryRecentActivities(query: RecentActivitiesQuery) {
  const resultDto = await window.activitySampling.queryRecentActivities(
    RecentActivitiesQueryDto.fromModel(query),
  );
  return RecentActivitiesQueryResultDto.create(resultDto).validate();
}

export async function queryReport(query: ReportQuery) {
  const resultDto = await window.activitySampling.queryReport(
    ReportQueryDto.from(query),
  );
  return ReportQueryResultDto.create(resultDto).validate();
}

export async function queryTimesheet(query: TimesheetQuery) {
  const resultDto = await window.activitySampling.queryTimesheet(
    TimesheetQueryDto.from(query),
  );
  return TimesheetQueryResultDto.create(resultDto).validate();
}
