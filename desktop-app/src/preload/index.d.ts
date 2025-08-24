// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../main/domain/activities";

export interface ActivitySampling {
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
