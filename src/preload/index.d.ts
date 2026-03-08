// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type Unsubscriber = () => void;

export interface ActivitySampling {
  logActivity(command: LogActivityCommandDto): Promise<CommandStatusDto>;

  exportTimesheet(
    command: ExportTimesheetCommandDto,
  ): Promise<CommandStatusDto>;

  queryRecentActivities(
    query: RecentActivitiesQueryDto,
  ): Promise<RecentActivitiesQueryResultDto>;

  queryReport(query: ReportQueryDto): Promise<ReportQueryResultDto>;

  queryStatistics(query: StatisticsQueryDto): Promise<StatisticsQueryResultDto>;

  queryTimesheet(query: TimesheetQueryDto): Promise<TimesheetQueryResultDto>;

  queryEstimate(query: EstimateQueryDto): Promise<EstimateQueryResultDto>;

  queryBurnUp(query: BurnUpQueryDto): Promise<BurnUpQueryResultDto>;

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

  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}
