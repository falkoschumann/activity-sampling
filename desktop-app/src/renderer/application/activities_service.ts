// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { CommandStatus } from "../../shared/common/messages";
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

export function useLogActivity(): [
  (command: LogActivityCommand) => void,
  CommandStatus | undefined,
] {
  const [command, setCommand] = useState<LogActivityCommand>();
  const [status, setStatus] = useState<CommandStatus>();

  useEffect(() => {
    async function logActivity() {
      if (command == null) {
        return;
      }

      const statusDto = await window.activitySampling.logActivity(
        LogActivityCommandDto.from(command),
      );
      setStatus(CommandStatusDto.create(statusDto).validate());
    }

    void logActivity();
  }, [command]);

  return [setCommand, status];
}

export function useRecentActivities(): [
  (query: RecentActivitiesQuery) => void,
  RecentActivitiesQueryResult,
] {
  const [query, setQuery] = useState<RecentActivitiesQuery>({});
  const [result, setResult] = useState<RecentActivitiesQueryResult>(
    RecentActivitiesQueryResult.empty(),
  );

  useEffect(() => {
    async function queryRecentActivities() {
      const resultDto = await window.activitySampling.queryRecentActivities(
        RecentActivitiesQueryDto.from(query),
      );
      setResult(RecentActivitiesQueryResultDto.create(resultDto).validate());
    }

    void queryRecentActivities();
  }, [query]);

  return [setQuery, result];
}
