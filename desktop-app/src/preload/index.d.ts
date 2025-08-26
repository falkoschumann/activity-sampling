// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { CommandStatus } from "../main/common/messages";
import type {
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../main/domain/activities";

export interface ActivitySampling {
  logActivity(command: LogActivityCommand): Promise<CommandStatus>;

  queryRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult>;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}

export {};
