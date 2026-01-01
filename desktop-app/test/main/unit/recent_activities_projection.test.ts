// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { projectRecentActivities } from "../../../src/main/domain/recent_activities_projection";
import {
  ActivityLoggedEvent,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../../../src/shared/domain/activities";
import { createAsyncGenerator } from "../common/tools";

describe("Recent activities projection", () => {
  it("should return an empty result when no activity is logged", async () => {
    const replay = createAsyncGenerator([]);

    const result = await projectRecentActivities(
      replay,
      RecentActivitiesQuery.create({}),
    );

    expect(result).toEqual<RecentActivitiesQueryResult>(
      RecentActivitiesQueryResult.empty(),
    );
  });

  it("should group activities by day for the last 30 days", async () => {
    const replay = createAsyncGenerator([
      // is not included, because older than 30 days
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-05-05T16:00" }),
      // 2 activities on different days
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-05-06T16:00" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-04T16:00" }),
      // 2 activities on the same day
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-05T10:30" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-05T11:00" }),
      // is not included, because it is in the next month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-07-01T12:30" }),
    ]);

    const result = await projectRecentActivities(
      replay,
      RecentActivitiesQuery.create({ today: "2025-06-05" }),
    );

    expect(result.workingDays).toEqual<WorkingDay[]>([
      WorkingDay.create({
        date: "2025-06-05",
        activities: [
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-05T11:00",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-05T10:30",
          }),
        ],
      }),
      WorkingDay.create({
        date: "2025-06-04",
        activities: [
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-04T16:00",
          }),
        ],
      }),
      WorkingDay.create({
        date: "2025-05-06",
        activities: [
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-05-06T16:00",
          }),
        ],
      }),
    ]);
  });

  it("should summarize hours worked for a month with 30 days", async () => {
    const replay = createAsyncGenerator([
      // the last day of last month is not included
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-05-31T16:00" }),
      // start of this month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-01T16:00" }),
      // end of last week
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-01T12:00" }),
      // start of this week
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-02T12:00" }),
      // the day before yesterday
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-03T12:00" }),
      // yesterday
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-04T12:00" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-04T12:30" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-04T13:00" }),
      // today
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-05T11:00" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-05T11:30" }),
      // tomorrow
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-06T10:30" }),
      // last day of this month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-30T10:30" }),
      // first day of next month is not included
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-07-01T12:30" }),
    ]);

    const result = await projectRecentActivities(
      replay,
      RecentActivitiesQuery.create({ today: "2025-06-05" }),
    );

    expect(result.timeSummary).toEqual<TimeSummary>(
      TimeSummary.create({
        hoursToday: "PT1H",
        hoursYesterday: "PT1H30M",
        hoursThisWeek: "PT4H",
        hoursThisMonth: "PT5H30M",
      }),
    );
  });

  it("should summarize hours worked for a month with 31 days", async () => {
    const replay = createAsyncGenerator([
      // the last day of last month is not included
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-11-30T12:00" }),
      // first day in month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-12-06T12:00" }),
      // first day in week
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-12-08T12:00" }),
      // yesterday
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-12-12T12:00" }),
      // today
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-12-13T12:00" }),
      // last day in week
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-12-14T12:00" }),
      // last day in month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-12-31T12:00" }),
      // first day of next month is not included
      ActivityLoggedEvent.createTestInstance({ dateTime: "2026-01-01T12:00" }),
    ]);

    const result = await projectRecentActivities(
      replay,
      RecentActivitiesQuery.create({ today: "2025-12-13" }),
    );

    expect(result.timeSummary).toEqual<TimeSummary>(
      TimeSummary.create({
        hoursToday: "PT30M",
        hoursYesterday: "PT30M",
        hoursThisWeek: "PT2H",
        hoursThisMonth: "PT3H",
      }),
    );
  });

  it("should summarize hours worked for a month with 28 days", async () => {
    const replay = createAsyncGenerator([
      // the last day of last month is not included
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-01-30T12:00" }),
      // first day in month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-02-06T12:00" }),
      // first day in week
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-02-10T12:00" }),
      // yesterday
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-02-12T12:00" }),
      // today
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-02-13T12:00" }),
      // last day in week
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-02-16T12:00" }),
      // last day in month
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-02-28T12:00" }),
      // first day of next month is not included
      ActivityLoggedEvent.createTestInstance({ dateTime: "2026-03-01T12:00" }),
    ]);

    const result = await projectRecentActivities(
      replay,
      RecentActivitiesQuery.create({ today: "2025-02-13" }),
    );

    expect(result.timeSummary).toEqual<TimeSummary>(
      TimeSummary.create({
        hoursToday: "PT30M",
        hoursYesterday: "PT30M",
        hoursThisWeek: "PT2H",
        hoursThisMonth: "PT3H",
      }),
    );
  });
});
