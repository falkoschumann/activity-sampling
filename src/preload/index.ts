// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  contextBridge,
  ipcRenderer,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
} from "electron/renderer";

import {
  EXPORT_TIMESHEET_CHANNEL,
  INTERVAL_ELAPSED_CHANNEL,
  LOG_ACTIVITY_CHANNEL,
  QUERY_BURN_UP_CHANNEL,
  QUERY_ESTIMATE_CHANNEL,
  QUERY_RECENT_ACTIVITIES_CHANNEL,
  QUERY_REPORT_CHANNEL,
  QUERY_SETTINGS_CHANNEL,
  QUERY_STATISTICS_CHANNEL,
  QUERY_TIMESHEET_CHANNEL,
  SHOW_OPEN_DIALOG_CHANNEL,
  TIMER_STARTED_CHANNEL,
  TIMER_STOPPED_CHANNEL,
  UPDATE_SETTINGS_CHANNEL,
} from "../shared/infrastructure/channels";

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: async (command: string): Promise<string> =>
    ipcRenderer.invoke(LOG_ACTIVITY_CHANNEL, command),

  exportTimesheet: async (command: string): Promise<string> =>
    ipcRenderer.invoke(EXPORT_TIMESHEET_CHANNEL, command),

  updateSettings: async (command: string): Promise<void> =>
    ipcRenderer.invoke(UPDATE_SETTINGS_CHANNEL, command),

  queryRecentActivities: async (query: string): Promise<string> =>
    ipcRenderer.invoke(QUERY_RECENT_ACTIVITIES_CHANNEL, query),

  queryReport: async (query: string): Promise<string> =>
    ipcRenderer.invoke(QUERY_REPORT_CHANNEL, query),

  queryStatistics: async (query: string): Promise<string> =>
    ipcRenderer.invoke(QUERY_STATISTICS_CHANNEL, query),

  queryTimesheet: async (query: string): Promise<string> =>
    ipcRenderer.invoke(QUERY_TIMESHEET_CHANNEL, query),

  queryEstimate: async (query: string): Promise<string> =>
    ipcRenderer.invoke(QUERY_ESTIMATE_CHANNEL, query),

  queryBurnUp: async (query: string): Promise<string> =>
    ipcRenderer.invoke(QUERY_BURN_UP_CHANNEL, query),

  querySettings: async (): Promise<string> =>
    ipcRenderer.invoke(QUERY_SETTINGS_CHANNEL),

  onTimerStartedEvent: (eventHandler: (event: string) => void) => {
    function listener(_event: unknown, args: string) {
      eventHandler(args);
    }

    ipcRenderer.on(TIMER_STARTED_CHANNEL, listener);
    return () => ipcRenderer.off(TIMER_STARTED_CHANNEL, listener);
  },

  onTimerStoppedEvent: (eventHandler: (event: string) => void) => {
    function listener(_event: unknown, args: string) {
      eventHandler(args);
    }

    ipcRenderer.on(TIMER_STOPPED_CHANNEL, listener);
    return () => ipcRenderer.off(TIMER_STOPPED_CHANNEL, listener);
  },

  onIntervalElapsedEvent: (eventListener: (event: string) => void) => {
    function listener(_event: unknown, args: string) {
      eventListener(args);
    }

    ipcRenderer.on(INTERVAL_ELAPSED_CHANNEL, listener);
    return () => ipcRenderer.off(INTERVAL_ELAPSED_CHANNEL, listener);
  },

  showOpenDialog: async (
    options: OpenDialogOptions,
  ): Promise<OpenDialogReturnValue> => {
    return ipcRenderer.invoke(SHOW_OPEN_DIALOG_CHANNEL, options);
  },
});
