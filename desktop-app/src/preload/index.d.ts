// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  type CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import {
  CurrentIntervalQueryDto,
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";

export type Unsubscriber = () => void;

export interface ActivitySampling {
  logActivity(command: LogActivityCommandDto): Promise<CommandStatusDto>;

  queryRecentActivities(
    query: RecentActivitiesQueryDto,
  ): Promise<RecentActivitiesQueryResultDto>;

  queryCurrentIntervalQuery(
    query: CurrentIntervalQueryDto,
  ): CurrentIntervalQueryDto;

  queryReport(query: ReportQueryDto): Promise<ReportQueryResultDto>;

  queryTimesheet(query: TimesheetQueryDto): Promise<TimesheetQueryResultDto>;

  onTimerStartedEvent: (
    callback: (event: TimerStartedEventDto) => void,
  ) => Unsubscriber;

  onTimerStoppedEvent: (
    callback: (event: TimerStoppedEventDto) => void,
  ) => Unsubscriber;

  onIntervalElapsedEvent: (
    callback: (event: IntervalElapsedEventDto) => void,
  ) => Unsubscriber;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}

export {};
