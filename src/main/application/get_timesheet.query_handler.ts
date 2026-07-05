// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createTimesheet,
  projectTimesheet,
} from "../../shared/domain/read_models/timesheet.read_model";
import {
  getTimesheet,
  type GetTimesheetQuery,
  type GetTimesheetQueryResult,
} from "../../shared/domain/read_models/get_timesheet.query";
import { createSettingsChangedEvent } from "../../shared/domain/settings/settings_changed.event";
import { createHolidaysChangedEvent } from "../../shared/domain/holiday/holidays_changed.event";
import { createVacationsChangedEvent } from "../../shared/domain/vacation/vacations_changed.event";
import type { EventStore } from "../infrastructure/event_store";
import { HolidayRepository } from "../infrastructure/holiday.repository";
import type { SettingsProvider } from "../infrastructure/settings.provider";
import { VacationRepository } from "../infrastructure/vacation.repository";

export class GetTimesheetQueryHandler {
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
    return new GetTimesheetQueryHandler(
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

  async handle(query: GetTimesheetQuery): Promise<GetTimesheetQueryResult> {
    const { from: fromDate, to: toDate, timeZone } = query.data;

    const settings = await this.#settingsProvider.load();
    let readModel = projectTimesheet(
      createTimesheet(),
      createSettingsChangedEvent(settings),
      { timeZone },
    );

    const holidays = await this.#holidayRepository.findAllByDate(
      fromDate,
      toDate,
    );
    readModel = projectTimesheet(
      readModel,
      createHolidaysChangedEvent({ holidays }),
      { timeZone },
    );

    const vacations = await this.#vacationRepository.findAllByDate(
      fromDate,
      toDate,
    );
    readModel = projectTimesheet(
      readModel,
      createVacationsChangedEvent({ vacations }),
      { timeZone },
    );

    const from = Temporal.PlainDate.from(fromDate)
      .toZonedDateTime(timeZone)
      .startOfDay();
    const to = Temporal.PlainDate.from(toDate)
      .add("P1D")
      .toZonedDateTime(timeZone)
      .startOfDay();
    for await (const event of this.#eventStore.replay({ from, to })) {
      readModel = projectTimesheet(readModel, event, { timeZone });
    }

    return getTimesheet(readModel, query);
  }
}
