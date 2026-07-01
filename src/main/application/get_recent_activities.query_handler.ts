// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  GetRecentActivitiesQuery,
  GetRecentActivitiesQueryResult,
} from "../../shared/domain/get_recent_activities.query";
import { SettingsChangedEvent } from "../domain/settings/settings_changed.event";
import {
  createTimesheet,
  projectTimesheet,
} from "../domain/timesheet.read_model";
import { getRecentActivities } from "../domain/get_recent_activities.query";
import type { EventStore } from "../infrastructure/event_store";
import type { SettingsProvider } from "../infrastructure/settings.provider";

export class GetRecentActivitiesQueryHandler {
  static create({
    eventStore,
    settingsProvider,
  }: {
    eventStore: EventStore;
    settingsProvider: SettingsProvider;
  }) {
    return new GetRecentActivitiesQueryHandler(eventStore, settingsProvider);
  }

  readonly #eventStore;
  readonly #settingsProvider;

  private constructor(
    eventStore: EventStore,
    settingsProvider: SettingsProvider,
  ) {
    this.#eventStore = eventStore;
    this.#settingsProvider = settingsProvider;
  }

  async handle(
    query: GetRecentActivitiesQuery,
  ): Promise<GetRecentActivitiesQueryResult> {
    query = GetRecentActivitiesQuery.create(query.data);
    const { today, timeZone } = query.data;

    const settings = await this.#settingsProvider.load();
    let view = projectTimesheet(
      createTimesheet(),
      SettingsChangedEvent.create(settings),
      { timeZone },
    );

    const fromDate = today.subtract({ days: 30 });
    const toDate = today.with({ day: today.daysInMonth }).add("P1D");
    const from = fromDate.toZonedDateTime(timeZone).startOfDay();
    const to = toDate.toZonedDateTime(timeZone).startOfDay();
    for await (const event of this.#eventStore.replay({ from, to })) {
      view = projectTimesheet(view, event, { timeZone });
    }

    return getRecentActivities(view, query);
  }
}
