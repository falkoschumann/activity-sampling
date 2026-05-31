// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/recent_activities_query";
import { RecentActivitiesProjection } from "../domain/recent_activities_projection";
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
    const replay = this.#eventStore.replay();
    const projection = RecentActivitiesProjection.create({ query });
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
