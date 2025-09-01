// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { contextBridge, ipcRenderer } from "electron";
import type { CommandStatus } from "../main/common/messages";

import {
  type LogActivityCommand,
  type RecentActivitiesQuery,
} from "../main/domain/activities";
import {
  CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../main/application/activities_messages";

contextBridge.exposeInMainWorld("activitySampling", {
  logActivity: async (command: LogActivityCommand): Promise<CommandStatus> => {
    const commandDto = LogActivityCommandDto.from(command);
    const statusDto = await ipcRenderer.invoke("logActivity", commandDto);
    return CommandStatusDto.create(statusDto).validate();
  },

  queryRecentActivities: async (query: RecentActivitiesQuery) => {
    const queryDto = RecentActivitiesQueryDto.from(query);
    const resultDto = await ipcRenderer.invoke(
      "queryRecentActivities",
      queryDto,
    );
    return RecentActivitiesQueryResultDto.create(resultDto).validate();
  },
});
