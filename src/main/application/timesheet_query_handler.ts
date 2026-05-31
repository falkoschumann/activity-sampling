// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { isTimestampInPeriod } from "../../shared/domain/temporal";
import type {
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import { CapacityChangedEvent } from "../domain/capacity_changed_event";
import { HolidaysChangedEvent } from "../domain/holidays_changed_event";
import {
  initialReadModel,
  projectTimesheet,
  queryTimesheet,
} from "../domain/timesheet_read_model";
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
  }: {
    eventStore: EventStore;
    holidayRepository: HolidayRepository;
    vacationRepository: VacationRepository;
    settingsProvider: SettingsProvider;
  }) {
    return new TimesheetQueryHandler(
      eventStore,
      holidayRepository,
      vacationRepository,
      settingsProvider,
    );
  }

  readonly #eventStore;
  readonly #holidayRepository;
  readonly #vacationRepository;
  readonly #settingsProvider;

  private constructor(
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    vacationRepository: VacationRepository,
    settingsProvider: SettingsProvider,
  ) {
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#vacationRepository = vacationRepository;
    this.#settingsProvider = settingsProvider;
  }

  async handle(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    let readModel = initialReadModel;

    const settings = await this.#settingsProvider.load();
    readModel = projectTimesheet(
      readModel,
      CapacityChangedEvent.create(settings),
    );

    const holidays = await this.#holidayRepository.findAllByDate(
      query.from,
      query.to,
    );
    readModel = projectTimesheet(
      readModel,
      HolidaysChangedEvent.create({ holidays }),
    );

    const vacations = await this.#vacationRepository.findAllByDate(
      query.from,
      query.to,
    );
    readModel = projectTimesheet(
      readModel,
      VacationChangedEvent.create({ vacations }),
    );

    for await (const event of this.#eventStore.replay()) {
      if (
        isTimestampInPeriod(
          event.timestamp,
          query.timeZone,
          query.from,
          query.to,
        )
      ) {
        readModel = projectTimesheet(readModel, event);
      }
    }

    return queryTimesheet(readModel, query);
  }
}
