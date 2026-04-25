// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/domain/temporal";
import type {
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import { TimesheetProjection } from "../domain/timesheet_projection";
import type { EventStore } from "../infrastructure/event_store";
import { HolidayRepository } from "../infrastructure/holiday_repository";
import { VacationRepository } from "../infrastructure/vacation_repository";

export class TimesheetQueryHandler {
  static create({
    capacity = "PT30M",
    eventStore,
    holidayRepository,
    vacationRepository,
    clock,
  }: {
    capacity?: Temporal.DurationLike | string;
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
    capacity: Temporal.DurationLike | string,
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    vacationRepository: VacationRepository,
    clock: Clock,
  ) {
    this.capacity = Temporal.Duration.from(capacity);
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#clock = clock;
  }

  async handle(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const today = this.#clock
      .instant()
      .toZonedDateTimeISO(timeZone ?? this.#clock.zone)
      .toPlainDate();
    const holidays = await this.#holidayRepository.findAllByDate(
      query.from,
      query.to,
    );
    const vacations = await this.#vacationRepository.findAllByDate(
      query.from,
      query.to,
    );
    const projection = TimesheetProjection.create({
      query,
      today,
      timeZone,
      capacity: this.capacity,
      holidays,
      vacations,
    });
    for await (const event of replay) {
      projection.update(event);
    }
    return projection.get();
  }
}
