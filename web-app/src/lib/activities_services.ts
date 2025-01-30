// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { RecentActivitiesQueryResult } from "@/lib/domain";
import { Duration } from "@/lib/duration";

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
      const response = await fetch(
        "http://localhost:3000/api/activities/recent-activities",
      );
      const json = await response.text();
      const result = JSON.parse(json, reviver);

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

const DATE_KEYS = ["timestamp", "date"];

const DURATION_KEYS = [
  "duration",
  "hoursToday",
  "hoursYesterday",
  "hoursThisWeek",
  "hoursThisMonth",
];

function reviver(key: string, value: unknown) {
  if (DATE_KEYS.includes(key)) {
    return new Date(value as string);
  } else if (DURATION_KEYS.includes(key)) {
    return Duration.parse(value as string);
  } else {
    return value;
  }
}
