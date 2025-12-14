// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Success } from "@muspellheim/shared";

import { Clock } from "../../shared/common/temporal";
import {
  type EstimateQuery,
  type EstimateQueryResult,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
  type ReportQuery,
  type ReportQueryResult,
  type StatisticsQuery,
  type StatisticsQueryResult,
  type TimesheetQuery,
  type TimesheetQueryResult,
} from "../../shared/domain/activities";
import { projectRecentActivities } from "../domain/recent_activities_projection";
import { projectReport } from "../domain/report_projection";
import { projectTimesheet } from "../domain/timesheet_projection";
import { projectEstimate, projectStatistics } from "../domain/activities";
import { Settings } from "../../shared/domain/settings";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import { HolidayRepository } from "../infrastructure/holiday_repository";
import { VacationRepository } from "../infrastructure/vacation_repository";

export class ActivitiesService {
  static create(): ActivitiesService {
    return new ActivitiesService(
      Settings.createDefault(),
      EventStore.create(),
      HolidayRepository.create(),
      VacationRepository.create(),
    );
  }

  #capacity: Temporal.Duration;
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
    this.#capacity = settings.capacity;
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#clock = clock;

    this.applySettings(settings);
  }

  applySettings(settings: Settings) {
    this.#capacity = settings.capacity;
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
    const replay = this.#replayTyped(this.#eventStore.replay(), query.timeZone);
    return await projectRecentActivities(replay, {
      ...query,
      today: query.today ?? this.#today(),
    });
  }

  async queryReport(query: ReportQuery): Promise<ReportQueryResult> {
    const replay = this.#replayTyped(this.#eventStore.replay(), query.timeZone);
    return projectReport(replay, query);
  }

  async queryStatistics(
    query: StatisticsQuery,
  ): Promise<StatisticsQueryResult> {
    const replay = this.#replayTyped(this.#eventStore.replay(), query.timeZone);
    return await projectStatistics({ replay, query });
  }

  async queryEstimate(query: EstimateQuery): Promise<EstimateQueryResult> {
    const replay = this.#replayTyped(this.#eventStore.replay(), query.timeZone);
    return projectEstimate({ query, replay });
  }

  async queryTimesheet(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    const replay = this.#replayTyped(this.#eventStore.replay(), query.timeZone);
    const holidays = await this.#holidayRepository.findAllByDate(
      query.from,
      query.to,
    );
    const vacations = await this.#vacationRepository.findAllByDate(
      query.from,
      query.to,
    );
    return projectTimesheet(
      replay,
      { ...query, today: query.today ?? this.#today() },
      {
        holidays,
        vacations,
        capacity: this.#capacity,
      },
    );
  }

  #today(timeZone?: Temporal.TimeZoneLike) {
    return this.#clock
      .instant()
      .toZonedDateTimeISO(timeZone ?? this.#clock.zone)
      .toPlainDate();
  }

  async *#replayTyped(
    events: AsyncGenerator,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    for await (const e of events) {
      yield ActivityLoggedEventDto.fromJson(e).validate(
        timeZone || this.#clock.zone,
      );
    }
  }
}
