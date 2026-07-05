// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetRecentActivitiesQueryHandler } from "../../../src/main/application/get_recent_activities.query_handler";
import {
  createSettings,
  type SettingsState,
} from "../../../src/shared/domain/settings/settings.aggregate";
import {
  type ActivityLoggedEvent,
  type ActivityLoggedEventData,
  createActivityLoggedEvent,
} from "../../../src/shared/domain/activity/activity_logged.event";
import {
  createRecentActivity,
  type RecentActivity,
} from "../../../src/shared/domain/recent_activity.value_object";
import {
  createGetRecentActivitiesQuery,
  createGetRecentActivitiesQueryResult,
} from "../../../src/shared/domain/get_recent_activities.query";
import type { WorkingDay } from "../../../src/shared/domain/working_day.value_object";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { SettingsProvider } from "../../../src/main/infrastructure/settings.provider";

const testLoggedEvent: ActivityLoggedEventData = {
  timestamp: "2025-08-14T11:00:00Z",
  duration: "PT30M",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  notification: "notifier",
};

const testRecentActivity: RecentActivity = {
  time: "13:00",
  client: "Test client",
  project: "Test project",
  task: "Test task",
};

const testSettings: SettingsState = {
  capacity: "PT32H",
  categories: ["", "Feature", "Rework", "Training"],
  firstName: "John",
  lastName: "Doe",
};

describe("Get recent Activities", () => {
  it("should return empty result when no activity is logged", async () => {
    const { handler } = configure({
      events: [],
    });

    const result = await handler.handle(createGetRecentActivitiesQuery());

    expect(result).toEqual(createGetRecentActivitiesQueryResult());
  });

  it("should group activities by day for the last 30 days", async () => {
    const events = [
      // is not included, because older than 30 days
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-05-05T14:00:00Z",
      }),
      // 2 activities on different days
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-05-06T14:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-04T14:00:00Z",
      }),
      // 2 activities on the same day
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-05T08:30:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-05T09:00:00Z",
      }),
      // is not included, because it is in the next month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-07-01T10:30:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      createGetRecentActivitiesQuery({ today: "2025-06-05" }),
    );

    expect(result.workingDays).toEqual<WorkingDay[]>([
      {
        date: Temporal.PlainDate.from("2025-06-05"),
        activities: [
          createRecentActivity({ ...testRecentActivity, time: "11:00:00" }),
          createRecentActivity({ ...testRecentActivity, time: "10:30:00" }),
        ],
      },
      {
        date: Temporal.PlainDate.from("2025-06-04"),
        activities: [
          createRecentActivity({ ...testRecentActivity, time: "16:00:00" }),
        ],
      },
      {
        date: Temporal.PlainDate.from("2025-05-06"),
        activities: [
          createRecentActivity({ ...testRecentActivity, time: "16:00:00" }),
        ],
      },
    ]);
  });

  it("should summarize hours worked for a month with 30 days", async () => {
    const events = [
      // the last day of last month is not included
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-05-31T14:00:00Z",
      }),
      // start of this month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-01T14:00:00Z",
      }),
      // end of last week
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-01T10:00:00Z",
      }),
      // start of this week
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-02T10:00:00Z",
      }),
      // the day before yesterday
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-03T10:00:00Z",
      }),
      // yesterday
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-04T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-04T10:30:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-04T11:00:00Z",
      }),
      // today
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-05T09:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-05T09:30:00Z",
      }),
      // tomorrow
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-06T08:30:00Z",
      }),
      // last day of this month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-06-30T08:30:00Z",
      }),
      // first day of next month is not included
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-07-01T10:30:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      createGetRecentActivitiesQuery({ today: "2025-06-05" }),
    );

    expect(result.timeSummary).toEqual({
      today: "PT1H",
      yesterday: "PT1H30M",
      thisWeek: "PT4H",
      thisMonth: "PT5H30M",
    });
  });

  it("should summarize hours worked for a month with 31 days", async () => {
    const events = [
      // the last day of last month is not included
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-11-30T10:00:00Z",
      }),
      // first day in month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-12-06T10:00:00Z",
      }),
      // first day in week
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-12-08T10:00:00Z",
      }),
      // yesterday
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-12-12T10:00:00Z",
      }),
      // today
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-12-13T10:00:00Z",
      }),
      // last day in week
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-12-14T10:00:00Z",
      }),
      // last day in month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-12-31T10:00:00Z",
      }),
      // first day of next month is not included
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-01-01T10:00:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      createGetRecentActivitiesQuery({ today: "2025-12-13" }),
    );

    expect(result.timeSummary).toEqual({
      today: "PT30M",
      yesterday: "PT30M",
      thisWeek: "PT2H",
      thisMonth: "PT3H",
    });
  });

  it("should summarize hours worked for a month with 28 days", async () => {
    const events = [
      // the last day of last month is not included
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-01-30T10:00:00Z",
      }),
      // first day in month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-02-06T10:00:00Z",
      }),
      // first day in week
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-02-10T10:00:00Z",
      }),
      // yesterday
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-02-12T10:00:00Z",
      }),
      // today
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-02-13T10:00:00Z",
      }),
      // last day in week
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-02-16T10:00:00Z",
      }),
      // last day in month
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2025-02-28T10:00:00Z",
      }),
      // first day of next month is not included
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-03-01T10:00:00Z",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(
      createGetRecentActivitiesQuery({ today: "2025-02-13" }),
    );

    expect(result.timeSummary).toEqual({
      today: "PT30M",
      yesterday: "PT30M",
      thisWeek: "PT2H",
      thisMonth: "PT3H",
    });
  });
});

function configure({ events }: { events?: ActivityLoggedEvent[] }) {
  const eventStore = EventStore.createNull({ events });
  const settingsProvider = SettingsProvider.createNull({
    readFileResponses: [createSettings(testSettings)],
  });
  const handler = GetRecentActivitiesQueryHandler.create({
    eventStore,
    settingsProvider,
  });
  return { handler };
}
