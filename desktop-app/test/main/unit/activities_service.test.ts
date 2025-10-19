// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import { ActivitiesService } from "../../../src/main/application/activities_service";
import {
  Activity,
  LogActivityCommand,
  ReportEntry,
  Scope,
  StatisticsQueryResult,
  TimesheetEntry,
} from "../../../src/shared/domain/activities";
import { Settings } from "../../../src/shared/domain/settings";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";
import {
  HolidayDto,
  HolidayRepository,
} from "../../../src/main/infrastructure/holiday_repository";
import {
  VacationDto,
  VacationRepository,
} from "../../../src/main/infrastructure/vacation_repository";

describe("Activities service", () => {
  describe("Log activity", () => {
    it("should log without an optional notes", async () => {
      const { service, eventStore } = configure();
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
      const { service, eventStore } = configure();
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
      const { service } = configure({
        events: mapTimestampsToEvents([
          "2025-06-04T14:00:00Z",
          "2025-06-05T08:30:00Z",
          "2025-06-05T09:00:00Z",
        ]),
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
      const { service } = configure({
        events: [
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
      });

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

  describe("Query statistics", () => {
    it("should return histogram for tasks per duration", async () => {
      const { service } = configure({
        events: [
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-10-13T11:00:00Z",
            task: "Task A",
            duration: "PT24H",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-10-14T13:00:00Z",
            task: "Task B",
            duration: "PT40H",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-10-15T13:00:00Z",
            task: "Task C",
            duration: "PT40H",
          }),
        ],
      });

      const result = await service.queryStatistics({});

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "0.5", "1", "2", "3", "5"],
          frequencies: [0, 0, 0, 1, 2],
          xAxisLabel: "Duration (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 3,
          edge50: 5,
          edge75: 5,
          edge100: 5,
        },
      });
    });
  });

  describe("Query timesheet", () => {
    it("should return timesheet", async () => {
      const { service } = configure({
        events: [
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-06-10T15:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-06-11T15:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [
          HolidayDto.create({ date: "2025-06-10", title: "Pfingstmontag" }),
        ],
        vacations: [],
        fixedInstant: "2025-06-11T15:00:00Z",
      });

      const result = await service.queryTimesheet({
        from: Temporal.PlainDate.from("2025-06-09"),
        to: Temporal.PlainDate.from("2025-06-15"),
      });

      expect(result).toEqual({
        entries: [
          TimesheetEntry.createTestInstance({
            date: Temporal.PlainDate.from("2025-06-10"),
            hours: Temporal.Duration.from("PT8H"),
          }),
          TimesheetEntry.createTestInstance({
            date: Temporal.PlainDate.from("2025-06-11"),
            hours: Temporal.Duration.from("PT8H"),
          }),
        ],
        totalHours: Temporal.Duration.from("PT16H"),
        capacity: {
          hours: Temporal.Duration.from("PT32H"),
          offset: Temporal.Duration.from("PT0H"),
        },
      });
    });
  });
});

function configure({
  events,
  holidays,
  vacations,
  fixedInstant,
}: {
  events?: unknown[];
  holidays?: HolidayDto[];
  vacations?: VacationDto[];
  fixedInstant?: string;
} = {}) {
  const eventStore = EventStore.createNull({ events });
  const holidayRepository = HolidayRepository.createNull({
    readFileResponses: holidays ? [holidays] : undefined,
  });
  const vacationRepository = VacationRepository.createNull({
    readFileResponses: vacations ? [vacations] : undefined,
  });
  const clock = Clock.fixed(
    fixedInstant ?? "1970-01-01T00:00:00Z",
    "Europe/Berlin",
  );
  const service = new ActivitiesService(
    Settings.createDefault(),
    eventStore,
    holidayRepository,
    vacationRepository,
    clock,
  );
  return { service, eventStore, holidayRepository, clock };
}

function mapTimestampsToEvents(timestamps: string[]) {
  return timestamps.map((timestamp) =>
    ActivityLoggedEventDto.createTestInstance({ timestamp }),
  );
}
