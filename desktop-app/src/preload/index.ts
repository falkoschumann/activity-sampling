// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron/renderer";

import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
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

  onTimerStartedEvent: (callback: (event: TimerStartedEventDto) => void) =>
    ipcRenderer.on("timerStarted", (_event, args) => callback(args)),

  onTimerStoppedEvent: (callback: (event: TimerStoppedEventDto) => void) =>
    ipcRenderer.on("timerStopped", (_event, args) => callback(args)),

  onIntervalElapsedEvent: (
    callback: (event: IntervalElapsedEventDto) => void,
  ) => ipcRenderer.on("intervalElapsed", (_event, args) => callback(args)),
});
