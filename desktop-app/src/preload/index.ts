// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron";

import type { RecentActivitiesQuery } from "../main/domain/activities";

contextBridge.exposeInMainWorld("activitySampling", {
  queryRecentActivities: (query: RecentActivitiesQuery) =>
    ipcRenderer.invoke("queryRecentActivities", query),
});
