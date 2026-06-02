// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/recent_activities_query";
import { isTimestampInPeriod } from "../../shared/domain/temporal";
import { CategoriesChangedEvent } from "../domain/categories_changed_event";
import { queryRecentActivities } from "../domain/recent_activities_query";
import { projectTimesheet } from "../domain/timesheet_read_model";
import type { EventStore } from "../infrastructure/event_store";
import type { SettingsProvider } from "../infrastructure/settings_provider";

export class RecentActivitiesQueryHandler {
  static create({
    eventStore,
    settingsProvider,
  }: {
    eventStore: EventStore;
    settingsProvider: SettingsProvider;
  }) {
    return new RecentActivitiesQueryHandler(eventStore, settingsProvider);
  }

  readonly #eventStore: EventStore;
  readonly #settingsProvider: SettingsProvider;

  private constructor(
    eventStore: EventStore,
    settingsProvider: SettingsProvider,
  ) {
    this.#eventStore = eventStore;
    this.#settingsProvider = settingsProvider;
  }

  async handle(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const settings = await this.#settingsProvider.load();
    let readModel = projectTimesheet(
      undefined,
      CategoriesChangedEvent.create(settings),
    );

    const from = query.today.subtract({ days: 30 });
    const to = query.today.with({ day: query.today.daysInMonth });
    for await (const event of this.#eventStore.replay()) {
      if (isTimestampInPeriod(event.timestamp, query.timeZone, from, to)) {
        readModel = projectTimesheet(readModel, event);
      }
    }

    return queryRecentActivities(readModel, query);
  }
}
