// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { RecentActivitiesQueryResult } from "../domain/messages.ts";
import { Duration } from "../domain/duration";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";

const activitiesApi = new ActivitiesApi();

export function useRecentActivities(): RecentActivitiesQueryResult {
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
    console.log("query recent activities");
    let ignore = false;
    (async () => {
      const result = await activitiesApi.getRecentActivities();

      if (!ignore) {
        setData(result);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return data;
}
