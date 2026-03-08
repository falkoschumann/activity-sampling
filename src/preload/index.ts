// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  contextBridge,
  ipcRenderer,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
} from "electron/renderer";

import type {
  CommandStatusDto,
  ExportTimesheetCommandDto,
  LogActivityCommandDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import {
  EXPORT_TIMESHEET_CHANNEL,
  INTERVAL_ELAPSED_CHANNEL,
  LOAD_SETTINGS_CHANNEL,
  LOG_ACTIVITY_CHANNEL,
  QUERY_BURN_UP_CHANNEL,
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
import {
  type BurnUpQueryDto,
  BurnUpQueryResultDto,
} from "../shared/infrastructure/burn_up_query_dto";
import {
  type RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../shared/infrastructure/recent_activities_query_dto";
import {
  StatisticsQueryDto,
  StatisticsQueryResultDto,
} from "../shared/infrastructure/statistics_query_dto";

// TODO map between DTOs and domain objects

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: async (
    command: LogActivityCommandDto,
  ): Promise<CommandStatusDto> => {
    return ipcRenderer.invoke(LOG_ACTIVITY_CHANNEL, command);
  },

  exportTimesheet: async (
    command: ExportTimesheetCommandDto,
  ): Promise<CommandStatusDto> => {
    return ipcRenderer.invoke(EXPORT_TIMESHEET_CHANNEL, command);
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

  queryBurnUp: async (query: BurnUpQueryDto): Promise<BurnUpQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_BURN_UP_CHANNEL, query);
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
