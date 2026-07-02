// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createSettings,
  type SettingsState,
} from "../../shared/domain/settings/settings.aggregate";
import {
  getSettings,
  GetSettingsQuery,
  GetSettingsQueryResult,
} from "../../shared/domain/get_settings.query";
import { SettingsProvider } from "../infrastructure/settings.provider";

export class GetSettingsQueryHandler {
  static create({ settingsProvider }: { settingsProvider: SettingsProvider }) {
    return new GetSettingsQueryHandler(settingsProvider);
  }

  static createNull({
    settings = createSettings(),
  }: { settings?: SettingsState } = {}) {
    return new GetSettingsQueryHandler(
      SettingsProvider.createNull({ readFileResponses: [settings] }),
    );
  }

  readonly #settingsProvider: SettingsProvider;

  private constructor(settingsProvider: SettingsProvider) {
    this.#settingsProvider = settingsProvider;
  }

  async handle(query: GetSettingsQuery): Promise<GetSettingsQueryResult> {
    query = GetSettingsQuery.create(query.data);
    const view = await this.#settingsProvider.load();
    return getSettings(view, query);
  }
}
