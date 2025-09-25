// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/activities";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../../shared/infrastructure/activities";
import { useCommandHandler, useQueryHandler } from "../common/messages_hooks";

export function useLogActivity() {
  return useCommandHandler<LogActivityCommand>({
    handler: handleLogActivityCommand,
  });
}

export function useRecentActivities() {
  return useQueryHandler<RecentActivitiesQuery, RecentActivitiesQueryResult>({
    handler: handleRecentActivitiesQuery,
    initialQuery: {},
    initialResult: RecentActivitiesQueryResult.empty(),
  });
}

async function handleLogActivityCommand(command: LogActivityCommand) {
  const statusDto = await window.activitySampling.logActivity(
    LogActivityCommandDto.from(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}

async function handleRecentActivitiesQuery(query: RecentActivitiesQuery) {
  const resultDto = await window.activitySampling.queryRecentActivities(
    RecentActivitiesQueryDto.from(query),
  );
  return RecentActivitiesQueryResultDto.create(resultDto).validate();
}
