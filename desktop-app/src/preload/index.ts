// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  contextBridge,
  ipcRenderer,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
} from "electron/renderer";

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
import {
  INTERVAL_ELAPSED_CHANNEL,
  LOAD_SETTINGS_CHANNEL,
  LOG_ACTIVITY_CHANNEL,
  QUERY_ESTIMATE_CHANNEL,
  QUERY_RECENT_ACTIVITIES_CHANNEL,
  QUERY_REPORT_CHANNEL,
  QUERY_STATISTICS_CHANNEL,
  QUERY_TIMESHEET_CHANNEL,
  SHOW_OPEN_DIALOG_CHANNEL,
  STORE_SETTINGS_CHANNEL,
  TIMER_STARTED_CHANNEL,
  TIMER_STOPPED_CHANNEL,
} from "../shared/infrastructure/channels";
import type { SettingsDto } from "../shared/infrastructure/settings";
import type {
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: async (
    command: LogActivityCommandDto,
  ): Promise<CommandStatusDto> => {
    return ipcRenderer.invoke(LOG_ACTIVITY_CHANNEL, command);
  },

  queryRecentActivities: async (
    query: RecentActivitiesQueryDto,
  ): Promise<RecentActivitiesQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_RECENT_ACTIVITIES_CHANNEL, query);
  },

  queryReport: async (query: ReportQueryDto): Promise<ReportQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_REPORT_CHANNEL, query);
  },

  queryStatistics: async (
    query: StatisticsQueryDto,
  ): Promise<StatisticsQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_STATISTICS_CHANNEL, query);
  },

  queryTimesheet: async (
    query: TimesheetQueryDto,
  ): Promise<TimesheetQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_TIMESHEET_CHANNEL, query);
  },

  queryEstimate: async (
    query: StatisticsQueryDto,
  ): Promise<StatisticsQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_ESTIMATE_CHANNEL, query);
  },

  onTimerStartedEvent: (
    eventHandler: (event: TimerStartedEventDto) => void,
  ) => {
    function listener(_event: unknown, args: TimerStartedEventDto) {
      eventHandler(args);
    }

    ipcRenderer.on(TIMER_STARTED_CHANNEL, listener);
    return () => ipcRenderer.off(TIMER_STARTED_CHANNEL, listener);
  },

  onTimerStoppedEvent: (
    eventHandler: (event: TimerStoppedEventDto) => void,
  ) => {
    function listener(_event: unknown, args: TimerStoppedEventDto) {
      eventHandler(args);
    }

    ipcRenderer.on(TIMER_STOPPED_CHANNEL, listener);
    return () => ipcRenderer.off(TIMER_STOPPED_CHANNEL, listener);
  },

  onIntervalElapsedEvent: (
    eventListener: (event: IntervalElapsedEventDto) => void,
  ) => {
    function listener(_event: unknown, args: IntervalElapsedEventDto) {
      eventListener(args);
    }

    ipcRenderer.on(INTERVAL_ELAPSED_CHANNEL, listener);
    return () => ipcRenderer.off(INTERVAL_ELAPSED_CHANNEL, listener);
  },

  loadSettings: async (): Promise<SettingsDto> => {
    return ipcRenderer.invoke(LOAD_SETTINGS_CHANNEL);
  },

  storeSettings: async (settings: SettingsDto): Promise<void> => {
    return ipcRenderer.invoke(STORE_SETTINGS_CHANNEL, settings);
  },

  showOpenDialog: async (
    options: OpenDialogOptions,
  ): Promise<OpenDialogReturnValue> => {
    return ipcRenderer.invoke(SHOW_OPEN_DIALOG_CHANNEL, options);
  },
});
