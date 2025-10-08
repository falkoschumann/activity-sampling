// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import type {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import type {
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";
import {
  INTERVAL_ELAPSED_CHANNEL,
  LOG_ACTIVITY_CHANNEL,
  QUERY_RECENT_ACTIVITIES_CHANNEL,
  QUERY_REPORT_CHANNEL,
  QUERY_TIMESHEET_CHANNEL,
  TIMER_STARTED_CHANNEL,
  TIMER_STOPPED_CHANNEL,
} from "../shared/infrastructure/channels";

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

  queryTimesheet: async (
    query: TimesheetQueryDto,
  ): Promise<TimesheetQueryResultDto> => {
    return ipcRenderer.invoke(QUERY_TIMESHEET_CHANNEL, query);
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
});
