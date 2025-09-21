// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import {
  Activity,
  LogActivityCommand,
  ReportEntry,
  Scope,
  TimesheetEntry,
} from "../../src/shared/domain/activities";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../src/main/infrastructure/events";

describe("Activities service", () => {
  describe("Log activity", () => {
    it("should log without an optional notes", async () => {
      const eventStore = EventStore.createNull();
      const service = ActivitiesService.createNull({ eventStore });
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(
        LogActivityCommand.createTestInstance(),
      );

      expect(status).toEqual(new Success());
      expect(recordEvents.data).toEqual([
        ActivityLoggedEventDto.createTestInstance(),
      ]);
    });

    it("should log with an optional notes", async () => {
      const eventStore = EventStore.createNull();
      const service = ActivitiesService.createNull({ eventStore });
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(
        LogActivityCommand.createTestInstance({ notes: "Lorem ipsum" }),
      );

      expect(status).toEqual(new Success());
      expect(recordEvents.data).toEqual([
        ActivityLoggedEventDto.createTestInstance({ notes: "Lorem ipsum" }),
      ]);
    });
  });

  describe("Query recent activities", () => {
    it("should return recent activities", async () => {
      const timestamps = [
        "2025-06-04T14:00:00Z",
        "2025-06-05T08:30:00Z",
        "2025-06-05T09:00:00Z",
      ];
      const eventStore = EventStore.createNull({
        events: [
          timestamps.map((timestamp) =>
            ActivityLoggedEventDto.createTestInstance({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-05T10:00:00Z",
      });

      const result = await service.queryRecentActivities({});

      expect(result).toEqual({
        workingDays: [
          {
            date: Temporal.PlainDate.from("2025-06-05"),
            activities: [
              Activity.createTestInstance({
                dateTime: Temporal.PlainDateTime.from("2025-06-05T11:00"),
              }),
              Activity.createTestInstance({
                dateTime: Temporal.PlainDateTime.from("2025-06-05T10:30"),
              }),
            ],
          },
          {
            date: Temporal.PlainDate.from("2025-06-04"),
            activities: [
              Activity.createTestInstance({
                dateTime: Temporal.PlainDateTime.from("2025-06-04T16:00"),
              }),
            ],
          },
        ],
        timeSummary: {
          hoursToday: Temporal.Duration.from("PT1H"),
          hoursYesterday: Temporal.Duration.from("PT30M"),
          hoursThisWeek: Temporal.Duration.from("PT1H30M"),
          hoursThisMonth: Temporal.Duration.from("PT1H30M"),
        },
      });
    });
  });

  describe("Query report", () => {
    it("should return report", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestInstance({
              timestamp: "2025-06-25T15:00:00Z",
              client: "Client 2",
              duration: "PT7H",
            }),
            ActivityLoggedEventDto.createTestInstance({
              timestamp: "2025-06-26T15:00:00Z",
              client: "Client 1",
              duration: "PT5H",
            }),
            ActivityLoggedEventDto.createTestInstance({
              timestamp: "2025-06-27T15:00:00Z",
              client: "Client 1",
              duration: "PT3H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport({ scope: Scope.CLIENTS });

      expect(result).toEqual({
        entries: [
          ReportEntry.createTestInstance({
            name: "Client 1",
            hours: Temporal.Duration.from("PT8H"),
          }),
          ReportEntry.createTestInstance({
            name: "Client 2",
            hours: Temporal.Duration.from("PT7H"),
          }),
        ],
        totalHours: Temporal.Duration.from("PT15H"),
      });
    });
  });

  describe("Query timesheet", () => {
    it("should return timesheet", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestInstance({
              timestamp: "2025-06-02T10:00:00Z",
            }),
            ActivityLoggedEventDto.createTestInstance({
              timestamp: "2025-06-02T10:30:00Z",
            }),
            ActivityLoggedEventDto.createTestInstance({
              timestamp: "2025-06-03T10:00:00Z",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet({
        from: Temporal.PlainDate.from("2025-06-02"),
        to: Temporal.PlainDate.from("2025-06-08"),
      });

      expect(result.entries).toEqual([
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-02"),
          hours: Temporal.Duration.from("PT1H"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-03"),
          hours: Temporal.Duration.from("PT30M"),
        }),
      ]);
    });
  });
});
