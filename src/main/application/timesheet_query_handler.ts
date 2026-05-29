// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Clock, isTimestampInPeriod } from "../../shared/domain/temporal";
import type {
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import { CapacityChangedEvent } from "../domain/capacity_changed_event";
import { HolidaysChangedEvent } from "../domain/holidays_changed_event";
import { TimesheetReadModel } from "../domain/timesheet_read_model";
import { VacationChangedEvent } from "../domain/vacation_changed_event";
import type { EventStore } from "../infrastructure/event_store";
import { HolidayRepository } from "../infrastructure/holiday_repository";
import { VacationRepository } from "../infrastructure/vacation_repository";
import type { SettingsProvider } from "../infrastructure/settings_provider";

export class TimesheetQueryHandler {
  static create({
    eventStore,
    holidayRepository,
    vacationRepository,
    settingsProvider,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    holidayRepository: HolidayRepository;
    vacationRepository: VacationRepository;
    settingsProvider: SettingsProvider;
    clock?: Clock;
  }) {
    return new TimesheetQueryHandler(
      eventStore,
      holidayRepository,
      vacationRepository,
      settingsProvider,
      clock,
    );
  }

  readonly #eventStore;
  readonly #holidayRepository;
  readonly #vacationRepository;
  readonly #settingsProvider;
  readonly #clock;

  private constructor(
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    vacationRepository: VacationRepository,
    settingsProvider: SettingsProvider,
    clock: Clock,
  ) {
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#settingsProvider = settingsProvider;
    this.#clock = clock;
  }

  async handle(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    const readModel = new TimesheetReadModel();

    const settings = await this.#settingsProvider.load();
    readModel.project(
      CapacityChangedEvent.create({ capacity: settings.capacity }),
    );

    const holidays = await this.#holidayRepository.findAllByDate(
      query.from,
      query.to,
    );
    readModel.project(HolidaysChangedEvent.create({ holidays }));

    const vacations = await this.#vacationRepository.findAllByDate(
      query.from,
      query.to,
    );
    readModel.project(VacationChangedEvent.create({ vacations }));

    const timeZone = query.timeZone ?? this.#clock.zone;
    const today =
      query.today ??
      this.#clock
        .instant()
        .toZonedDateTimeISO(timeZone ?? this.#clock.zone)
        .toPlainDate();
    for await (const event of this.#eventStore.replay()) {
      if (
        isTimestampInPeriod(event.timestamp, timeZone, query.from, query.to)
      ) {
        readModel.project(event);
      }
    }

    return readModel.queryTimesheet({
      from: query.from,
      to: query.to,
      today,
      timeZone,
    });
  }
}
