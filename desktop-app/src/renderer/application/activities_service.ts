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
  const [status, setStatus] = useState<CommandStatus>();
  const [command, setCommand] = useState<LogActivityCommand>();

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
  RecentActivitiesQueryResult,
  (query: RecentActivitiesQuery) => void,
] {
  const [query, setQuery] = useState<RecentActivitiesQuery>({});
  const [result, setResult] = useState<RecentActivitiesQueryResult>(
    RecentActivitiesQueryResult.empty(),
  );

  useEffect(() => {
    async function queryRecentActivities() {
      const dto = await window.activitySampling.queryRecentActivities(
        RecentActivitiesQueryDto.from(query),
      );
      const result = RecentActivitiesQueryResultDto.create(dto).validate();
      setResult(result);
    }

    void queryRecentActivities();
  }, [query]);

  return [result, setQuery];
}
