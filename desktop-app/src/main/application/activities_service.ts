// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import { Clock } from "../../shared/common/temporal";
import {
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
  type ReportQuery,
  type ReportQueryResult,
  type TimesheetQuery,
  type TimesheetQueryResult,
} from "../../shared/domain/activities";
import {
  projectRecentActivities,
  projectReport,
  projectTimesheet,
} from "../domain/activities";
import { Settings } from "../domain/settings";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import { HolidayRepository } from "../infrastructure/holiday_repository";
import { VacationRepository } from "../infrastructure/vacation_repository";

export class ActivitiesService {
  static create({
    settings = Settings.createDefault(),
  } = {}): ActivitiesService {
    return new ActivitiesService(
      settings,
      EventStore.create(),
      HolidayRepository.create(),
      VacationRepository.create(),
    );
  }

  #settings: Settings;
  readonly #eventStore: EventStore;
  readonly #holidayRepository: HolidayRepository;
  readonly #vacationRepository: VacationRepository;
  readonly #clock: Clock;

  constructor(
    settings: Settings,
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    vacationRepository: VacationRepository,
    clock = Clock.systemDefaultZone(),
  ) {
    this.#settings = settings;
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#clock = clock;

    this.applySettings(settings);
  }

  applySettings(settings: Settings) {
    this.#settings = settings;
    this.#eventStore.fileName = `${settings.dataDir}/activity-log.csv`;
    this.#holidayRepository.fileName = `${settings.dataDir}/holidays.csv`;
    this.#vacationRepository.fileName = `${settings.dataDir}/vacation.csv`;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const event = ActivityLoggedEventDto.create({
      ...command,
      timestamp: command.timestamp.toString({ smallestUnit: "seconds" }),
      duration: command.duration.toString(),
    });
    await this.#eventStore.record(event);
    return new Success();
  }

  async queryRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const replay = replayTyped(this.#eventStore.replay());
    return await projectRecentActivities(replay, query, this.#clock);
  }

  async queryReport(query: ReportQuery): Promise<ReportQueryResult> {
    const replay = replayTyped(this.#eventStore.replay());
    return projectReport(replay, query, this.#clock);
  }

  async queryTimesheet(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    const replay = replayTyped(this.#eventStore.replay());
    const holidays = await this.#holidayRepository.findAllByDate(
      query.from,
      query.to,
    );
    const vacations = await this.#vacationRepository.findAllByDate(
      query.from,
      query.to,
    );
    return projectTimesheet({
      replay,
      query,
      holidays,
      vacations,
      capacity: this.#settings.capacity,
      clock: this.#clock,
    });
  }
}

async function* replayTyped(events: AsyncGenerator) {
  for await (const e of events) {
    yield ActivityLoggedEventDto.fromJson(e).validate();
  }
}
