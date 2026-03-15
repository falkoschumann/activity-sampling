// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../../src/main/application/activities_service";
import { Clock } from "../../../src/shared/domain/temporal";
import { LogActivityCommand } from "../../../src/shared/domain/log_activity_command";
import { Settings } from "../../../src/shared/domain/settings";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import {
  HolidayDto,
  HolidayRepository,
} from "../../../src/main/infrastructure/holiday_repository";
import { TimesheetExporter } from "../../../src/main/infrastructure/timesheet_exporter";
import {
  VacationDto,
  VacationRepository,
} from "../../../src/main/infrastructure/vacation_repository";

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

function configure({
  events,
  holidays,
  vacations,
  fixedInstant,
}: {
  events?: ActivityLoggedEventDto[];
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
    TimesheetExporter.createNull(),
    clock,
  );
  return { service, eventStore, holidayRepository, clock };
}
