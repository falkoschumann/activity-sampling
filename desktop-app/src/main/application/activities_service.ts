// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
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
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import { HolidayRepository } from "../infrastructure/holiday_repository";

export interface ActivitiesConfiguration {
  readonly capacity: Temporal.Duration;
}

export class ActivitiesService {
  static create({
    configuration = { capacity: Temporal.Duration.from("PT40H") },
    eventStore = EventStore.create(),
    holidayRepository = HolidayRepository.create(),
    clock = Clock.systemDefaultZone(),
  }: {
    configuration?: ActivitiesConfiguration;
    eventStore?: EventStore;
    holidayRepository?: HolidayRepository;
    clock?: Clock;
  } = {}): ActivitiesService {
    return new ActivitiesService(
      configuration,
      eventStore,
      holidayRepository,
      clock,
    );
  }

  static createNull({
    configuration = { capacity: Temporal.Duration.from("PT40H") },
    eventStore = EventStore.createNull(),
    holidayRepository = HolidayRepository.createNull({ holidays: [[]] }),
    fixedInstant = "1970-01-01T00:00:00Z",
    zone = "Europe/Berlin",
  }: {
    configuration?: ActivitiesConfiguration;
    eventStore?: EventStore;
    holidayRepository?: HolidayRepository;
    fixedInstant?: Temporal.Instant | string;
    zone?: Temporal.TimeZoneLike;
  } = {}): ActivitiesService {
    return new ActivitiesService(
      configuration,
      eventStore,
      holidayRepository,
      Clock.fixed(fixedInstant, zone),
    );
  }

  readonly #configuration: ActivitiesConfiguration;
  readonly #eventStore: EventStore;
  readonly #holidayRepository: HolidayRepository;
  readonly #clock: Clock;

  constructor(
    configuration: ActivitiesConfiguration,
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    clock: Clock,
  ) {
    this.#configuration = configuration;
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#clock = clock;
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
    return projectRecentActivities(replay, query, this.#clock);
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
    return projectTimesheet(
      replay,
      holidays,
      query,
      this.#configuration.capacity,
      this.#clock,
    );
  }
}

async function* replayTyped(events: AsyncGenerator) {
  for await (const e of events) {
    // TODO handle type error
    const event = ActivityLoggedEventDto.fromJson(e).validate();
    yield event;
  }
}
