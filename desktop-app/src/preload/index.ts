// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron";
import type { RecentActivitiesQuery } from "../main/domain/activities";

contextBridge.exposeInMainWorld("activitySampling", {
  queryRecentActivities: (query: RecentActivitiesQuery) =>
    ipcRenderer.invoke("queryRecentActivities", query),
});

contextBridge.exposeInMainWorld("electron", {
  ping: () => ipcRenderer.send("ping"),
  process: {
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    },
  },
});
