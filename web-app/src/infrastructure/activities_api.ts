// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Duration } from "../domain/duration.ts";
import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages.ts";

export class ActivitiesApi {
  readonly #baseUrl = "/api/activities";

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const url = new URL(`${this.#baseUrl}/log-activity`, window.location.href);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    return response.json();
  }

  async getRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const url = new URL(
      `${this.#baseUrl}/recent-activities`,
      window.location.href,
    );
    if (query.today) {
      url.searchParams.append("today", query.today.toISOString());
    }
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
