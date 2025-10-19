// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  StatisticsQueryDto,
  StatisticsQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import type { SettingsDto } from "../shared/infrastructure/settings";
import type {
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

  queryReport(query: ReportQueryDto): Promise<ReportQueryResultDto>;

  queryStatistics(query: StatisticsQueryDto): Promise<StatisticsQueryResultDto>;

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

  loadSettings(): Promise<SettingsDto>;

  storeSettings(settings: SettingsDto): Promise<void>;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}

export {};
