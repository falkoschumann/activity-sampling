// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetTimesheetQueryHandler } from "../../../src/main/application/get_timesheet.query_handler";
import {
  createHoliday,
  type HolidayState,
} from "../../../src/shared/domain/holiday/holiday.aggregate";
import {
  type ActivityLoggedEvent,
  type ActivityLoggedEventData,
  createActivityLoggedEvent,
} from "../../../src/shared/domain/activity/activity_logged.event";
import {
  createVacation,
  type VacationState,
} from "../../../src/shared/domain/vacation/vacation.aggregate";
import {
  createSettings,
  type SettingsState,
} from "../../../src/shared/domain/settings/settings.aggregate";
import {
  createGetTimesheetQuery,
  createGetTimesheetQueryResult,
} from "../../../src/shared/domain/get_timesheet.query";
import { createCapacity } from "../../../src/shared/domain/capacity.value_object";
import {
  createTimesheetEntry,
  type TimesheetEntry,
} from "../../../src/shared/domain/timesheet_entry.value_object";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { HolidayRepository } from "../../../src/main/infrastructure/holiday.repository";
import { VacationRepository } from "../../../src/main/infrastructure/vacation.repository";
import { SettingsProvider } from "../../../src/main/infrastructure/settings.provider";

const testLoggedEvent: ActivityLoggedEventData = {
  timestamp: "2025-08-14T11:00:00Z",
  duration: "PT30M",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  notification: "notifier",
};

const testTimesheetEntry: TimesheetEntry = {
  date: "2025-06-04",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  hours: "PT2H",
};

describe("Get timesheet", () => {
  describe("Summarize hours worked on tasks", () => {
    it("should return an empty result when no activities are logged", async () => {
      const { handler } = configure({
        events: [],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-09-15",
          to: "2025-09-21",
          today: "2025-09-19",
        }),
      );

      expect(result).toEqual(
        createGetTimesheetQueryResult({
          entries: [],
          totalHours: "PT0S",
          capacity: createCapacity({
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
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-01T10:00:00Z",
          }),
          // monday, same task
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-02T10:00:00Z",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-02T10:30:00Z",
          }),
          // tuesday, different tasks
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-03T10:00:00Z",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-03T10:30:00Z",
            task: "Other task",
          }),
          // wednesday, different projects
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-04T10:00:00Z",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-04T10:30:00Z",
            project: "Other project",
          }),
          // thursday, different clients
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-05T10:00:00Z",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-05T10:30:00Z",
            client: "Other client",
          }),
          // friday to sunday, no activities logged
          // next monday, excluded because next week
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-09T10:00:00Z",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-02",
          to: "2025-06-08",
          today: "2025-11-19",
        }),
      );

      expect(result.entries).toEqual<TimesheetEntry[]>([
        createTimesheetEntry({
          ...testTimesheetEntry,
          date: "2025-06-02",
          hours: "PT1H",
        }),
        createTimesheetEntry({
          ...testTimesheetEntry,
          date: "2025-06-03",
          task: "Other task",
          hours: "PT30M",
        }),
        createTimesheetEntry({
          ...testTimesheetEntry,
          date: "2025-06-03",
          hours: "PT30M",
        }),
        createTimesheetEntry({
          ...testTimesheetEntry,
          date: "2025-06-04",
          project: "Other project",
          hours: "PT30M",
        }),
        createTimesheetEntry({
          ...testTimesheetEntry,
          date: "2025-06-04",
          hours: "PT30M",
        }),
        createTimesheetEntry({
          ...testTimesheetEntry,
          date: "2025-06-05",
          client: "Other client",
          hours: "PT30M",
        }),
        createTimesheetEntry({
          ...testTimesheetEntry,
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
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-02T10:00:00Z",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-02T10:30:00Z",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-02T11:00:00Z",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-02",
          to: "2025-06-08",
          today: "2025-11-19",
        }),
      );

      expect(result.totalHours).toEqual("PT1H30M");
    });
  });

  describe("Summarize in a period", () => {
    it("should return timesheet", async () => {
      const { handler } = configure({
        events: [
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-08T15:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-09T15:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-15T15:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-16T15:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [
          createHoliday({ date: "2025-06-10", title: "Pfingstmontag" }),
        ],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-11",
        }),
      );

      expect(result).toEqual(
        createGetTimesheetQueryResult({
          entries: [
            createTimesheetEntry({
              ...testTimesheetEntry,
              date: "2025-06-09",
              hours: "PT8H",
            }),
            createTimesheetEntry({
              ...testTimesheetEntry,
              date: "2025-06-15",
              hours: "PT8H",
            }),
          ],
          totalHours: "PT16H",
          capacity: createCapacity({
            hours: "PT32H",
            offset: "PT0S",
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
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.totalHours).toEqual("PT32H");
      expect(result.capacity).toEqual(
        createCapacity({ hours: "PT40H", offset: "PT0S" }),
      );
    });

    it("should return a negative offset when hours is behind of the capacity", async () => {
      const { handler } = configure({
        events: [
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT6H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT6H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT6H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.capacity).toEqual(
        createCapacity({ hours: "PT40H", offset: "-PT6H" }),
      );
    });

    it("should return a positive offset when hours is ahead of the capacity", async () => {
      const { handler } = configure({
        events: [
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT10H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT10H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT10H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.capacity).toEqual(
        createCapacity({ hours: "PT40H", offset: "PT6H" }),
      );
    });

    it("should return the offset for capacity in the future", async () => {
      const { handler } = configure({
        events: [
          // query a week on thursday
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-03",
        }),
      );

      expect(result.totalHours).toEqual("PT32H");
      expect(result.capacity).toEqual(
        createCapacity({ hours: "PT40H", offset: "PT24H" }),
      );
    });
  });

  describe("Take holidays into account", () => {
    it("should take holidays into account", async () => {
      const { handler } = configure({
        events: [
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [
          createHoliday({ date: "2025-06-09", title: "Pfingstmontag" }),
        ],
        vacations: [],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-06-09",
          to: "2025-06-15",
          today: "2025-06-12",
        }),
      );

      expect(result.capacity).toEqual(
        createCapacity({ hours: "PT32H", offset: "PT0S" }),
      );
    });
  });

  describe("Take vacation into account", () => {
    it("should take vacation into account", async () => {
      const { handler } = configure({
        events: [
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-09-08T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-09-09T14:00:00Z",
            duration: "PT8H",
          }),
          createActivityLoggedEvent({
            ...testLoggedEvent,
            timestamp: "2025-09-11T14:00:00Z",
            duration: "PT8H",
          }),
        ],
        holidays: [],
        vacations: [createVacation({ date: "2025-09-10" })],
      });

      const result = await handler.handle(
        createGetTimesheetQuery({
          from: "2025-09-08",
          to: "2025-09-14",
          today: "2025-09-11",
        }),
      );

      expect(result.capacity).toEqual(
        createCapacity({ hours: "PT32H", offset: "PT0S" }),
      );
    });
  });
});

function configure({
  events,
  holidays,
  vacations,
  settings = createSettings(),
}: {
  events?: ActivityLoggedEvent[];
  holidays?: HolidayState[];
  vacations?: VacationState[];
  settings?: SettingsState;
} = {}) {
  const eventStore = EventStore.createNull({ events });
  const holidayRepository = HolidayRepository.createNull({
    readFileResponses: holidays ? [holidays] : undefined,
  });
  const vacationRepository = VacationRepository.createNull({
    readFileResponses: vacations ? [vacations] : undefined,
  });
  const settingsProvider = SettingsProvider.createNull({
    readFileResponses: settings ? [settings] : undefined,
  });
  const handler = GetTimesheetQueryHandler.create({
    eventStore,
    holidayRepository,
    vacationRepository,
    settingsProvider,
  });
  return { handler };
}
