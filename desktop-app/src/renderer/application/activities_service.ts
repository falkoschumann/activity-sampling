// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import {
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/activities";
import {
  IntervalElapsedEventDto,
  type TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../../shared/infrastructure/timer";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../../shared/infrastructure/activities";
import { useCommandHandler, useQueryHandler } from "../common/messages_hooks";

export function useCurrentInterval(): [
  boolean,
  (isFormDisabled: boolean) => void,
] {
  const [isFormDisabled, setFormDisabled] = useState(false);

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (_event: TimerStartedEventDto) => setFormDisabled(true),
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (_event: TimerStoppedEventDto) => setFormDisabled(false),
    );

    const offIntervalElapsedEvent =
      window.activitySampling.onIntervalElapsedEvent(
        (_event: IntervalElapsedEventDto) => setFormDisabled(false),
      );

    return () => {
      offTimerStartedEvent();
      offTimerStoppedEvent();
      offIntervalElapsedEvent();
    };
  }, []);

  return [isFormDisabled, setFormDisabled];
}

export function useLogActivity() {
  return useCommandHandler<LogActivityCommand>({
    handler: handleLogActivityCommand,
  });
}

async function handleLogActivityCommand(command: LogActivityCommand) {
  const statusDto = await window.activitySampling.logActivity(
    LogActivityCommandDto.from(command),
  );
  return CommandStatusDto.create(statusDto).validate();
}

export function useRecentActivities() {
  return useQueryHandler<RecentActivitiesQuery, RecentActivitiesQueryResult>({
    handler: handleRecentActivitiesQuery,
    initialQuery: {},
    initialResult: RecentActivitiesQueryResult.empty(),
  });
}

async function handleRecentActivitiesQuery(query: RecentActivitiesQuery) {
  const resultDto = await window.activitySampling.queryRecentActivities(
    RecentActivitiesQueryDto.from(query),
  );
  return RecentActivitiesQueryResultDto.create(resultDto).validate();
}
