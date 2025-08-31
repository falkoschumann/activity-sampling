// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron";
import type { CommandStatus } from "../main/common/messages";

import type {
  LogActivityCommand,
  RecentActivitiesQuery,
} from "../main/domain/activities";

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: (command: LogActivityCommand): Promise<CommandStatus> =>
    ipcRenderer.invoke("logActivity", command),

  queryRecentActivities: async (query: RecentActivitiesQuery) => {
    const result = await ipcRenderer.invoke("queryRecentActivities", query);
    console.log("preload", JSON.stringify(result));
    return result;
  },
});
