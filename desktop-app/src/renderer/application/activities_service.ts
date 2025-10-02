// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  LogActivityCommand,
  RecentActivitiesQuery,
  TimesheetQuery,
} from "../../shared/domain/activities";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../../shared/infrastructure/activities";

export async function logActivity(command: LogActivityCommand) {
  const statusDto = await window.activitySampling.logActivity(
    LogActivityCommandDto.from(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}

export async function queryRecentActivities(query: RecentActivitiesQuery) {
  const resultDto = await window.activitySampling.queryRecentActivities(
    RecentActivitiesQueryDto.from(query),
  );
  return RecentActivitiesQueryResultDto.create(resultDto).validate();
}

export async function queryTimesheet(query: TimesheetQuery) {
  const resultDto = await window.activitySampling.queryTimesheet(
    TimesheetQueryDto.from(query),
  );
  return TimesheetQueryResultDto.create(resultDto).validate();
}
