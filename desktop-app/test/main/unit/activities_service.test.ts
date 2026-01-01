// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import { ActivitiesService } from "../../../src/main/application/activities_service";
import {
  ActivityLoggedEvent,
  Capacity,
  EstimateQuery,
  EstimateQueryResult,
  LogActivityCommand,
  RecentActivitiesQueryResult,
  ReportEntry,
  ReportQueryResult,
  ReportScope,
  StatisticsQueryResult,
  StatisticsScope,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  TimeSummary,
  WorkingDay,
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
    it("should log with all required fields", async () => {
      const { service, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(
        LogActivityCommand.createTestInstance(),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(recordEvents.data).toEqual<ActivityLoggedEventDto[]>([
        ActivityLoggedEventDto.createTestInstance(),
      ]);
    });

    it("should log with an optional notes", async () => {
      const { service, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(
        LogActivityCommand.createTestInstance({ notes: "Lorem ipsum" }),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(recordEvents.data).toEqual<ActivityLoggedEventDto[]>([
        ActivityLoggedEventDto.createTestInstance({ notes: "Lorem ipsum" }),
      ]);
    });

    it("should log with an optional category", async () => {
      const { service, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(
        LogActivityCommand.createTestInstance({ category: "Lorem ipsum" }),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(recordEvents.data).toEqual<ActivityLoggedEventDto[]>([
        ActivityLoggedEventDto.createTestInstance({ category: "Lorem ipsum" }),
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

      expect(result).toEqual<RecentActivitiesQueryResult>({
        workingDays: [
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
        ],
        timeSummary: TimeSummary.create({
          hoursToday: "PT1H",
          hoursYesterday: "PT30M",
          hoursThisWeek: "PT1H30M",
          hoursThisMonth: "PT1H30M",
        }),
      });
    });

    it("should throw an error when event is not parseable", async () => {
      const { service } = configure({
        events: [
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "invalid-timestamp",
          }),
        ],
      });

      const result = service.queryRecentActivities({});

      await expect(result).rejects.toThrowError(TypeError);
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

      const result = await service.queryReport({ scope: ReportScope.CLIENTS });

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              client: "Client 1",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              client: "Client 2",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });
  });

  describe("Query statistics", () => {
    it("should return statistics for working hours", async () => {
      const { service } = configure({
        events: [
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-10-13T11:00:00Z",
            task: "Task A",
            duration: "PT24H",
            category: "Category 2",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-10-14T13:00:00Z",
            task: "Task B",
            duration: "PT40H",
            category: "Category 1",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-10-15T13:00:00Z",
            task: "Task C",
            duration: "PT40H",
            category: "Category 2",
          }),
        ],
      });

      const result = await service.queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

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
        categories: ["Category 1", "Category 2"],
        totalCount: 3,
      });
    });

    it("should return statistics for cycle time", async () => {
      const { service } = configure({
        events: [
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-08-13T12:00:00Z",
            task: "Task A",
            category: "Category A",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-08-13T12:00:00Z",
            task: "Task B",
            category: "Category B",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-08-16T12:00:00Z",
            task: "Task A",
            category: "Category A",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-08-18T12:00:00Z",
            task: "Task B",
            category: "Category B",
          }),
        ],
      });

      const result = await service.queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "1", "2", "3", "5", "8"],
          frequencies: [0, 0, 0, 1, 1],
          xAxisLabel: "Cycle time (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 4,
          edge50: 5,
          edge75: 5,
          edge100: 6,
        },
        categories: ["Category A", "Category B"],
        totalCount: 2,
      });
    });
  });

  describe("Query estimate", () => {
    it("should return estimate", async () => {
      const { service } = configure({
        events: [
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-11-17T15:00:00Z",
            task: "Task A",
            category: "Category A",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-11-17T15:00:00Z",
            task: "Task B",
            category: "Category B",
          }),
          ActivityLoggedEventDto.createTestInstance({
            timestamp: "2025-11-18T15:00:00Z",
            task: "Task A",
            category: "Category A",
          }),
        ],
      });

      const result = await service.queryEstimate(EstimateQuery.create({}));

      expect(result).toEqual<EstimateQueryResult>({
        cycleTimes: [
          {
            cycleTime: 1,
            frequency: 1,
            probability: 0.5,
            cumulativeProbability: 0.5,
          },
          {
            cycleTime: 2,
            frequency: 1,
            probability: 0.5,
            cumulativeProbability: 1.0,
          },
        ],
        categories: ["Category A", "Category B"],
        totalCount: 2,
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

      const result = await service.queryTimesheet(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
        }),
      );

      expect(result).toEqual<TimesheetQueryResult>(
        TimesheetQueryResult.create({
          entries: [
            TimesheetEntry.createTestInstance({
              date: "2025-06-10",
              hours: "PT8H",
            }),
            TimesheetEntry.createTestInstance({
              date: "2025-06-11",
              hours: "PT8H",
            }),
          ],
          totalHours: "PT16H",
          capacity: Capacity.create({
            hours: "PT32H",
            offset: "PT0H",
          }),
        }),
      );
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
