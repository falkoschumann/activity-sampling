// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Success } from "@muspellheim/shared";

import { Clock } from "../../shared/common/temporal";
import { exportTimesheet } from "./export_timesheet";
import { queryEstimate } from "./estimate_query_handler";
import { queryBurnUp } from "./burn_up_query_handler";
import { Settings } from "../../shared/domain/settings";
import {
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
import type { ExportTimesheetCommand } from "../../shared/domain/export_timesheet_command";
import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import {
  type EstimateQuery,
  type EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { projectRecentActivities } from "../domain/recent_activities_projection";
import { projectReport } from "../domain/report_projection";
import { projectStatistics } from "../domain/statistics_projection";
import { projectTimesheet } from "../domain/timesheet_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import { EventStore } from "../infrastructure/event_store";
import { HolidayRepository } from "../infrastructure/holiday_repository";
import { VacationRepository } from "../infrastructure/vacation_repository";
import { TimesheetExporter } from "../infrastructure/timesheet_exporter";

// TODO remove activities service, use message handlers instead

export class ActivitiesService {
  static create(): ActivitiesService {
    return new ActivitiesService(
      Settings.createDefault(),
      EventStore.create(),
      HolidayRepository.create(),
      VacationRepository.create(),
      TimesheetExporter.create(),
    );
  }

  #capacity: Temporal.Duration;
  readonly #eventStore: EventStore;
  readonly #holidayRepository: HolidayRepository;
  readonly #vacationRepository: VacationRepository;
  readonly #timesheetExporter: TimesheetExporter;
  readonly #clock: Clock;

  constructor(
    settings: Settings,
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    vacationRepository: VacationRepository,
    timesheetExporter: TimesheetExporter,
    clock = Clock.systemDefaultZone(),
  ) {
    this.#capacity = settings.capacity;
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#timesheetExporter = timesheetExporter;
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

  async exportTimesheet(command: ExportTimesheetCommand) {
    return exportTimesheet(command, this.#timesheetExporter);
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
    return await projectStatistics(replay, query);
  }

  async queryEstimate(query: EstimateQuery): Promise<EstimateQueryResult> {
    return queryEstimate(query, this.#eventStore, this.#clock);
  }

  async queryBurnUp(query: BurnUpQuery): Promise<BurnUpQueryResult> {
    return queryBurnUp(query, this.#eventStore, this.#clock);
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
