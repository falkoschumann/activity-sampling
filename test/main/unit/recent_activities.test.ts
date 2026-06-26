// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetRecentActivitiesQueryHandler } from "../../../src/main/application/get_recent_activities.query_handler";
import { createTestSettings } from "../../../src/main/domain/settings/settings.aggregate";
import { ActivityLoggedEvent } from "../../../src/main/domain/logged-activity/activity_logged.event";
import { RecentActivity } from "../../../src/shared/domain/recent_activity";
import {
  GetRecentActivitiesQuery,
  GetRecentActivitiesQueryResult,
} from "../../../src/shared/domain/get_recent_activities.query";
import type { WorkingDay } from "../../../src/shared/domain/working_day";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { SettingsProvider } from "../../../src/main/infrastructure/settings.provider";

describe("Recent Activities", () => {
  it("should return empty result when no activity is logged", async () => {
    const { handler } = configure({
      events: [],
    });

    const result = await handler.handle(GetRecentActivitiesQuery.create());

    expect(result).toEqual(GetRecentActivitiesQueryResult.create());
  });

  it("should group activities by day for the last 30 days", async () => {
    const events = [
      // is not included, because older than 30 days
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-05-05T14:00:00Z",
      }),
      // 2 activities on different days
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-05-06T14:00:00Z",
      }),
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-04T14:00:00Z",
      }),
      // 2 activities on the same day
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-05T08:30:00Z",
      }),
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-05T09:00:00Z",
      }),
      // is not included, because it is in the next month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-07-01T10:30:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      GetRecentActivitiesQuery.create({ today: "2025-06-05" }),
    );

    expect(result.workingDays).toEqual<WorkingDay[]>([
      {
        date: Temporal.PlainDate.from("2025-06-05"),
        activities: [
          RecentActivity.createTestInstance({ time: "11:00" }),
          RecentActivity.createTestInstance({ time: "10:30" }),
        ],
      },
      {
        date: Temporal.PlainDate.from("2025-06-04"),
        activities: [RecentActivity.createTestInstance({ time: "16:00" })],
      },
      {
        date: Temporal.PlainDate.from("2025-05-06"),
        activities: [RecentActivity.createTestInstance({ time: "16:00" })],
      },
    ]);
  });

  it("should summarize hours worked for a month with 30 days", async () => {
    const events = [
      // the last day of last month is not included
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-05-31T14:00:00Z",
      }),
      // start of this month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-01T14:00:00Z",
      }),
      // end of last week
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-01T10:00:00Z",
      }),
      // start of this week
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-02T10:00:00Z",
      }),
      // the day before yesterday
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-03T10:00:00Z",
      }),
      // yesterday
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-04T10:00:00Z",
      }),
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-04T10:30:00Z",
      }),
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-04T11:00:00Z",
      }),
      // today
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-05T09:00:00Z",
      }),
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-05T09:30:00Z",
      }),
      // tomorrow
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-06T08:30:00Z",
      }),
      // last day of this month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-30T08:30:00Z",
      }),
      // first day of next month is not included
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-07-01T10:30:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      GetRecentActivitiesQuery.create({ today: "2025-06-05" }),
    );

    expect(result.timeSummary).toEqual({
      today: Temporal.Duration.from("PT1H"),
      yesterday: Temporal.Duration.from("PT1H30M"),
      thisWeek: Temporal.Duration.from("PT4H"),
      thisMonth: Temporal.Duration.from("PT5H30M"),
    });
  });

  it("should summarize hours worked for a month with 31 days", async () => {
    const events = [
      // the last day of last month is not included
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-11-30T10:00:00Z",
      }),
      // first day in month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-12-06T10:00:00Z",
      }),
      // first day in week
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-12-08T10:00:00Z",
      }),
      // yesterday
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-12-12T10:00:00Z",
      }),
      // today
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-12-13T10:00:00Z",
      }),
      // last day in week
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-12-14T10:00:00Z",
      }),
      // last day in month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-12-31T10:00:00Z",
      }),
      // first day of next month is not included
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2026-01-01T10:00:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      GetRecentActivitiesQuery.create({ today: "2025-12-13" }),
    );

    expect(result.timeSummary).toEqual({
      today: Temporal.Duration.from("PT30M"),
      yesterday: Temporal.Duration.from("PT30M"),
      thisWeek: Temporal.Duration.from("PT2H"),
      thisMonth: Temporal.Duration.from("PT3H"),
    });
  });

  it("should summarize hours worked for a month with 28 days", async () => {
    const events = [
      // the last day of last month is not included
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-01-30T10:00:00Z",
      }),
      // first day in month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-02-06T10:00:00Z",
      }),
      // first day in week
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-02-10T10:00:00Z",
      }),
      // yesterday
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-02-12T10:00:00Z",
      }),
      // today
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-02-13T10:00:00Z",
      }),
      // last day in week
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-02-16T10:00:00Z",
      }),
      // last day in month
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-02-28T10:00:00Z",
      }),
      // first day of next month is not included
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2026-03-01T10:00:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      GetRecentActivitiesQuery.create({ today: "2025-02-13" }),
    );

    expect(result.timeSummary).toEqual({
      today: Temporal.Duration.from("PT30M"),
      yesterday: Temporal.Duration.from("PT30M"),
      thisWeek: Temporal.Duration.from("PT2H"),
      thisMonth: Temporal.Duration.from("PT3H"),
    });
  });
});

function configure({ events }: { events?: ActivityLoggedEvent[] }) {
  const eventStore = EventStore.createNull({ events });
  const settingsProvider = SettingsProvider.createNull({
    readFileResponses: [createTestSettings()],
  });
  const handler = GetRecentActivitiesQueryHandler.create({
    eventStore,
    settingsProvider,
  });
  return { handler };
}
