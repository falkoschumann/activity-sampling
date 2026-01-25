// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import { queryRecentActivities } from "../../../src/main/application/recent_activities_query_handler";
import { ActivityLoggedEvent } from "../../../src/shared/domain/activities";
import {
  RecentActivitiesQuery,
  TimeSummary,
  WorkingDay,
} from "../../../src/shared/domain/recent_activities_query";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Recent Activities", () => {
  describe("Group activities by working days for the last 30 days", () => {
    it("should return an empty list when no activity is logged", async () => {
      const { queryRecentActivities } = configure({
        events: [],
      });

      const result = await queryRecentActivities(
        RecentActivitiesQuery.create(),
      );

      expect(result.workingDays).toEqual<WorkingDay[]>([]);
    });

    it("should group activities by day for the last 30 days", async () => {
      const events = [
        // is not included, because older than 30 days
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-05-05T14:00:00Z",
        }),
        // 2 activities on different days
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-05-06T14:00:00Z",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-04T14:00:00Z",
        }),
        // 2 activities on the same day
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-05T08:30:00Z",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-05T09:00:00Z",
        }),
        // is not included, because it is in the next month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-07-01T10:30:00Z",
        }),
      ];
      const { queryRecentActivities } = configure({ events });

      const result = await queryRecentActivities(
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

    it("should throw an error when event is not parseable", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "invalid-timestamp",
        }),
      ];
      const { queryRecentActivities } = configure({
        events,
        fixedInstant: "2025-06-05T10:00:00Z",
      });

      const result = queryRecentActivities(RecentActivitiesQuery.create());

      await expect(result).rejects.toThrowError(TypeError);
    });
  });

  describe("Summarize hours worked today, yesterday, this week and this month", () => {
    it("should return 0 when no activity is logged", async () => {
      const { queryRecentActivities } = configure({
        events: [],
      });

      const result = await queryRecentActivities(
        RecentActivitiesQuery.create(),
      );

      expect(result.timeSummary).toEqual<TimeSummary>(
        TimeSummary.create({
          hoursToday: "PT0S",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT0S",
          hoursThisMonth: "PT0S",
        }),
      );
    });

    it("should summarize hours worked for a month with 30 days", async () => {
      const events = [
        // the last day of last month is not included
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-05-31T14:00:00Z",
        }),
        // start of this month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-01T14:00:00Z",
        }),
        // end of last week
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-01T10:00:00Z",
        }),
        // start of this week
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-02T10:00:00Z",
        }),
        // the day before yesterday
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-03T10:00:00Z",
        }),
        // yesterday
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-04T10:00:00Z",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-04T10:30:00Z",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-04T11:00:00Z",
        }),
        // today
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-05T09:00:00Z",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-05T09:30:00Z",
        }),
        // tomorrow
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-06T08:30:00Z",
        }),
        // last day of this month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-30T08:30:00Z",
        }),
        // first day of next month is not included
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-07-01T10:30:00Z",
        }),
      ];
      const { queryRecentActivities } = configure({ events });

      const result = await queryRecentActivities(
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
      const events = [
        // the last day of last month is not included
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-30T10:00:00Z",
        }),
        // first day in month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-12-06T10:00:00Z",
        }),
        // first day in week
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-12-08T10:00:00Z",
        }),
        // yesterday
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-12-12T10:00:00Z",
        }),
        // today
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-12-13T10:00:00Z",
        }),
        // last day in week
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-12-14T10:00:00Z",
        }),
        // last day in month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-12-31T10:00:00Z",
        }),
        // first day of next month is not included
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2026-01-01T10:00:00Z",
        }),
      ];
      const { queryRecentActivities } = configure({ events });

      const result = await queryRecentActivities(
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
      const events = [
        // the last day of last month is not included
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-01-30T10:00:00Z",
        }),
        // first day in month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-02-06T10:00:00Z",
        }),
        // first day in week
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-02-10T10:00:00Z",
        }),
        // yesterday
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-02-12T10:00:00Z",
        }),
        // today
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-02-13T10:00:00Z",
        }),
        // last day in week
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-02-16T10:00:00Z",
        }),
        // last day in month
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-02-28T10:00:00Z",
        }),
        // first day of next month is not included
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2026-03-01T10:00:00Z",
        }),
      ];
      const { queryRecentActivities } = configure({ events });

      const result = await queryRecentActivities(
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
});

function configure({
  events,
  fixedInstant,
}: {
  events?: ActivityLoggedEventDto[];
  fixedInstant?: string;
}) {
  const eventStore = EventStore.createNull({ events });
  const clock = Clock.fixed(
    fixedInstant ?? "1970-01-01T00:00:00Z",
    "Europe/Berlin",
  );
  return {
    queryRecentActivities: (query: RecentActivitiesQuery) =>
      queryRecentActivities(query, eventStore, clock),
  };
}
