// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  type CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../shared/infrastructure/activities";
import {
  CurrentIntervalQueryDto,
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";

export interface ActivitySampling {
  logActivity(command: LogActivityCommandDto): Promise<CommandStatusDto>;

  queryRecentActivities(
    query: RecentActivitiesQueryDto,
  ): Promise<RecentActivitiesQueryResultDto>;

  queryCurrentIntervalQuery(
    query: CurrentIntervalQueryDto,
  ): CurrentIntervalQueryDto;

  onTimerStartedEvent: (
    callback: (event: TimerStartedEventDto) => void,
  ) => void;

  onTimerStoppedEvent: (
    callback: (event: TimerStoppedEventDto) => void,
  ) => void;

  onIntervalElapsedEvent: (
    callback: (event: IntervalElapsedEventDto) => void,
  ) => void;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}

export {};
