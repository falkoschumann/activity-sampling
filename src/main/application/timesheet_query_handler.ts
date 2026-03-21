// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/domain/temporal";
import type {
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import { projectTimesheet } from "../domain/timesheet_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";
import { HolidayRepository } from "../infrastructure/holiday_repository";
import { VacationRepository } from "../infrastructure/vacation_repository";

export class TimesheetQueryHandler {
  static create({
    capacity,
    eventStore,
    holidayRepository,
    vacationRepository,
    clock,
  }: {
    capacity: Temporal.Duration;
    eventStore: EventStore;
    holidayRepository: HolidayRepository;
    vacationRepository: VacationRepository;
    clock: Clock;
  }) {
    return new TimesheetQueryHandler(
      capacity,
      eventStore,
      holidayRepository,
      vacationRepository,
      clock,
    );
  }

  capacity: Temporal.Duration;

  readonly #eventStore: EventStore;
  readonly #holidayRepository: HolidayRepository;
  readonly #vacationRepository: VacationRepository;
  readonly #clock: Clock;

  private constructor(
    capacity: Temporal.Duration,
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    vacationRepository: VacationRepository,
    clock: Clock,
  ) {
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#clock = clock;
    this.capacity = capacity;
  }

  async handle(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    // TODO handle time zone in projection
    // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
    const timeZone = query.timeZone || this.#clock.zone;
    const today = this.#clock
      .instant()
      .toZonedDateTimeISO(timeZone ?? this.#clock.zone)
      .toPlainDate();
    const replay = replayTyped(this.#eventStore.replay(), timeZone);
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
      { ...query, today: query.today ?? today },
      {
        holidays,
        vacations,
        capacity: this.capacity,
      },
    );
  }
}

async function* replayTyped(
  events: AsyncGenerator,
  timeZone: Temporal.TimeZoneLike,
) {
  for await (const e of events) {
    yield ActivityLoggedEventDto.fromJson(e).validate(timeZone);
  }
}
