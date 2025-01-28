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

function reviver(key: string, value: unknown) {
  if (key === "timestamp" || key === "date") {
    return new Date(value as string);
  }
  if (
    [
      "duration",
      "hoursToday",
      "hoursYesterday",
      "hoursThisWeek",
      "hoursThisMonth",
    ].includes(key)
  ) {
    return Duration.parse(value as string);
  }
  return value;
}
