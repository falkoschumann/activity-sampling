// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Duration } from "../domain/duration";
import {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages.ts";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";

const activitiesApi = new ActivitiesApi();

export function useRecentActivities(
  initialQuery: RecentActivitiesQuery = {},
): [RecentActivitiesQueryResult, (query: RecentActivitiesQuery) => void] {
  const [query, setQuery] = useState<RecentActivitiesQuery>(initialQuery);
  const [data, setData] = useState<RecentActivitiesQueryResult>({
    workingDays: [],
    timeSummary: {
      hoursToday: Duration.ZERO,
      hoursYesterday: Duration.ZERO,
      hoursThisWeek: Duration.ZERO,
      hoursThisMonth: Duration.ZERO,
    },
  });

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      const result = await activitiesApi.getRecentActivities(query);
      if (!ignore) {
        console.log("set data", result);
        setData(result);
      }
    }

    void startFetching();

    return () => {
      ignore = true;
    };
  }, [query]);

  return [data, setQuery];
}
