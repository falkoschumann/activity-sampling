// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../main/application/activities_messages";

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
});
