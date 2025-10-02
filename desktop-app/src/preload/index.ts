// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
  ReportQueryDto,
  ReportQueryResultDto,
  TimesheetQueryDto,
  TimesheetQueryResultDto,
} from "../shared/infrastructure/activities";
import {
  type CurrentIntervalQueryDto,
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../shared/infrastructure/timer";

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: async (
    command: LogActivityCommandDto,
  ): Promise<CommandStatusDto> => {
    return ipcRenderer.invoke("logActivity", command);
  },

  queryRecentActivities: async (
    query: RecentActivitiesQueryDto,
  ): Promise<RecentActivitiesQueryResultDto> => {
    return ipcRenderer.invoke("queryRecentActivities", query);
  },

  queryCurrentIntervalQuery: (query: CurrentIntervalQueryDto) => {
    return ipcRenderer.invoke("queryCurrentInterval", query);
  },

  queryReport: async (query: ReportQueryDto): Promise<ReportQueryResultDto> => {
    return ipcRenderer.invoke("queryReport", query);
  },

  queryTimesheet: async (
    query: TimesheetQueryDto,
  ): Promise<TimesheetQueryResultDto> => {
    return ipcRenderer.invoke("queryTimesheet", query);
  },

  onTimerStartedEvent: (
    eventHandler: (event: TimerStartedEventDto) => void,
  ) => {
    function listener(_event: unknown, args: TimerStartedEventDto) {
      eventHandler(args);
    }

    ipcRenderer.on("timerStarted", listener);
    return () => ipcRenderer.off("timerStarted", listener);
  },

  onTimerStoppedEvent: (
    eventHandler: (event: TimerStoppedEventDto) => void,
  ) => {
    function listener(_event: unknown, args: TimerStoppedEventDto) {
      eventHandler(args);
    }

    ipcRenderer.on("timerStopped", listener);
    return () => ipcRenderer.off("timerStopped", listener);
  },

  onIntervalElapsedEvent: (
    eventListener: (event: IntervalElapsedEventDto) => void,
  ) => {
    function listener(_event: unknown, args: IntervalElapsedEventDto) {
      eventListener(args);
    }

    ipcRenderer.on("intervalElapsed", listener);
    return () => ipcRenderer.off("intervalElapsed", listener);
  },
});
