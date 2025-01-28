// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { RecentActivitiesQueryResult } from "@/lib/domain";
import { Duration } from "@/lib/duration";

export class ActivitiesApi {
  async queryRecentActivities(): Promise<RecentActivitiesQueryResult> {
    const response = await fetch(
      "http://localhost:3000/api/activities/recent-activities",
    );
    const json = await response.text();
    return JSON.parse(json, reviver);
  }
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
