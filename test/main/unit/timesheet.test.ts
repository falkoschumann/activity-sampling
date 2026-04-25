// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

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
  it("should return timesheet", async () => {
    const { handler } = configure({
      events: [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-10T15:00:00Z",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
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
