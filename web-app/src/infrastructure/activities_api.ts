// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Duration } from "../domain/duration.ts";
import {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages.ts";

export class ActivitiesApi {
  async getRecentActivities(
    query: RecentActivitiesQuery = { today: new Date() },
  ): Promise<RecentActivitiesQueryResult> {
    const url = new URL(
      "/api/activities/recent-activities",
      window.location.href,
    );
    url.searchParams.append("today", query.today.toISOString());
    const response = await fetch(url);
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
