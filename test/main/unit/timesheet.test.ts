// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { TimesheetQueryHandler } from "../../../src/main/application/timesheet_query_handler";
import { Settings } from "../../../src/shared/domain/settings";
import { Clock } from "../../../src/shared/domain/temporal";
import {
  Capacity,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../../src/shared/domain/timesheet_query";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import {
  HolidayDto,
  HolidayRepository,
} from "../../../src/main/infrastructure/holiday_repository";
import {
  VacationDto,
  VacationRepository,
} from "../../../src/main/infrastructure/vacation_repository";

describe("Timesheet", () => {
  describe("Summarize hours worked on tasks", () => {
    it("should return an empty result when no activities are logged", async () => {
      const { handler } = configure({
        events: [],
        holidays: [],
        vacations: [],
        fixedInstant: "2025-09-19T06:00:00Z",
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-09-15",
          to: "2025-09-21",
        }),
      );

      expect(result).toEqual<TimesheetQueryResult>(
        TimesheetQueryResult.create({
          entries: [],
          totalHours: "PT0S",
          capacity: Capacity.create({
            hours: "PT40H",
            offset: "-PT40H",
          }),
        }),
      );
    });

    it("should summarize hours worked", async () => {
      const { handler } = configure({
        events: [
          // last sunday, excluded because last week
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-01T10:00:00Z",
          }),
          // monday, same task
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-02T10:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-02T10:30:00Z",
          }),
          // tuesday, different tasks
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-03T10:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-03T10:30:00Z",
            task: "Other task",
          }),
          // wednesday, different projects
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-04T10:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-04T10:30:00Z",
            project: "Other project",
          }),
          // thursday, different clients
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-05T10:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-05T10:30:00Z",
            client: "Other client",
          }),
          // friday to sunday, no activities logged
          // next monday, excluded because next week
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T10:00:00Z",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-02",
          to: "2025-06-08",
          today: "2025-11-19",
        }),
      );

      expect(result.entries).toEqual<TimesheetEntry[]>([
        TimesheetEntry.createTestInstance({
          date: "2025-06-02",
          hours: "PT1H",
        }),
        TimesheetEntry.createTestInstance({
          date: "2025-06-03",
          task: "Other task",
          hours: "PT30M",
        }),
        TimesheetEntry.createTestInstance({
          date: "2025-06-03",
          hours: "PT30M",
        }),
        TimesheetEntry.createTestInstance({
          date: "2025-06-04",
          project: "Other project",
          hours: "PT30M",
        }),
        TimesheetEntry.createTestInstance({
          date: "2025-06-04",
          hours: "PT30M",
        }),
        TimesheetEntry.createTestInstance({
          date: "2025-06-05",
          client: "Other client",
          hours: "PT30M",
        }),
        TimesheetEntry.createTestInstance({
          date: "2025-06-05",
          hours: "PT30M",
        }),
      ]);
    });
  });

  describe("Summarize the total hours worked", () => {
    it("should summarize the total hours worked", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-02T10:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-02T10:30:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-02T11:00:00Z",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-02",
          to: "2025-06-08",
          today: "2025-11-19",
        }),
      );

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT1H30M"),
      );
    });
  });

  describe("Summarize in a period", () => {
    it("should return timesheet", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-08T15:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T15:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-15T15:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-16T15:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [
          HolidayDto.create({ date: "2025-06-10", title: "Pfingstmontag" }),
        ],
        vacations: [],
        fixedInstant: "2025-06-11T15:00:00Z",
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
        }),
      );

      expect(result).toEqual<TimesheetQueryResult>(
        TimesheetQueryResult.create({
          entries: [
            TimesheetEntry.createTestInstance({
              date: "2025-06-09",
              hours: "PT8H",
            }),
            TimesheetEntry.createTestInstance({
              date: "2025-06-15",
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

  describe("Compare with capacity", () => {
    it("should return the offset 0 when capacity is reached", async () => {
      const { handler } = configure({
        events: [
          // query a week on thursday
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT32H"),
      );
      expect(result.capacity).toEqual<Capacity>(
        Capacity.create({ hours: "PT40H", offset: "PT0S" }),
      );
    });

    it("should return a negative offset when hours is behind of the capacity", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT6H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT6H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT6H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.capacity).toEqual<Capacity>(
        Capacity.create({ hours: "PT40H", offset: "-PT6H" }),
      );
    });

    it("should return a positive offset when hours is ahead of the capacity", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT10H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT10H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT10H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.capacity).toEqual<Capacity>(
        Capacity.create({ hours: "PT40H", offset: "PT6H" }),
      );
    });

    it("should return the offset for capacity in the future", async () => {
      const { handler } = configure({
        events: [
          // query a week on thursday
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-03",
        }),
      );

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT32H"),
      );
      expect(result.capacity).toEqual<Capacity>(
        Capacity.create({ hours: "PT40H", offset: "PT24h" }),
      );
    });
  });

  describe("Take holidays into account", () => {
    it("should take holidays into account", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [
          HolidayDto.create({ date: "2025-06-09", title: "Pfingstmontag" }),
        ],
        vacations: [],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.capacity).toEqual<Capacity>(
        Capacity.create({ hours: "PT32H", offset: "PT0S" }),
      );
    });
  });

  describe("Take vacation into account", () => {
    it("should take vacation into account", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-08T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-11T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [],
        vacations: [VacationDto.create({ date: "2025-09-10" })],
      });

      const result = await handler.handle(
        TimesheetQuery.create({
          from: "2025-09-08",
          to: "2025-09-14",
          today: "2025-09-11",
        }),
      );

      expect(result.capacity).toEqual<Capacity>(
        Capacity.create({ hours: "PT32H", offset: "PT0S" }),
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
  events?: ActivityLoggedEvent[];
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
  const handler = TimesheetQueryHandler.create({
    capacity: Settings.create().capacity,
    eventStore,
    holidayRepository,
    vacationRepository,
    clock,
  });
  return { handler };
}
