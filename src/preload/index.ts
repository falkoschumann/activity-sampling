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

// TODO map between DTOs and domain objects

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: async (command: string): Promise<string> =>
    ipcRenderer.invoke(LOG_ACTIVITY_CHANNEL, command),

  exportTimesheet: async (command: string): Promise<string> =>
    ipcRenderer.invoke(EXPORT_TIMESHEET_CHANNEL, command),

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

  loadSettings: async (): Promise<string> =>
    ipcRenderer.invoke(LOAD_SETTINGS_CHANNEL),

  storeSettings: async (settings: string): Promise<void> =>
    ipcRenderer.invoke(STORE_SETTINGS_CHANNEL, settings),

  showOpenDialog: async (
    options: OpenDialogOptions,
  ): Promise<OpenDialogReturnValue> => {
    return ipcRenderer.invoke(SHOW_OPEN_DIALOG_CHANNEL, options);
  },
});
