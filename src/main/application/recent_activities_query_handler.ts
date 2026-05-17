// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Clock } from "../../shared/domain/temporal";
import {
  type RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/recent_activities_query";
import type { EventStore } from "../infrastructure/event_store";
import { RecentActivitiesProjection } from "../domain/recent_activities_projection";
import type { SettingsProvider } from "../infrastructure/settings_provider";

export class RecentActivitiesQueryHandler {
  static create({
    eventStore,
    settingsProvider,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    settingsProvider: SettingsProvider;
    clock?: Clock;
  }) {
    return new RecentActivitiesQueryHandler(
      eventStore,
      settingsProvider,
      clock,
    );
  }

  readonly #eventStore: EventStore;
  readonly #settingsProvider: SettingsProvider;
  readonly #clock: Clock;

  private constructor(
    eventStore: EventStore,
    settingsProvider: SettingsProvider,
    clock: Clock,
  ) {
    this.#eventStore = eventStore;
    this.#settingsProvider = settingsProvider;
    this.#clock = clock;
  }

  async handle(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const settings = await this.#settingsProvider.load();
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const today = this.#clock
      .instant()
      .toZonedDateTimeISO(timeZone ?? this.#clock.zone)
      .toPlainDate();
    const projection = RecentActivitiesProjection.create({
      query,
      today,
      timeZone,
    });
    for await (const event of replay) {
      projection.update(event);
    }
    const result = projection.get();
    return RecentActivitiesQueryResult.create({
      ...result,
      categories: settings.categories,
    });
  }
}
