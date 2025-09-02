// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  type CommandStatusDto,
  LogActivityCommandDto,
  RecentActivitiesQueryDto,
  RecentActivitiesQueryResultDto,
} from "../main/application/activities_messages";

export interface ActivitySampling {
  logActivity(command: LogActivityCommandDto): Promise<CommandStatusDto>;

  queryRecentActivities(
    query: RecentActivitiesQueryDto,
  ): Promise<RecentActivitiesQueryResultDto>;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}

export {};
