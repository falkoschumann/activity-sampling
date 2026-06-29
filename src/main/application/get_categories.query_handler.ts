// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createSettings,
  type SettingsState,
} from "../domain/settings/settings.aggregate";
import {
  type GetCategoriesQuery,
  GetCategoriesQueryResult,
} from "../../shared/domain/get_categories.query";
import { getCategories } from "../domain/get_categories.query";
import { SettingsProvider } from "../infrastructure/settings.provider";

export class GetCategoriesQueryHandler {
  static create({ settingsProvider }: { settingsProvider: SettingsProvider }) {
    return new GetCategoriesQueryHandler(settingsProvider);
  }

  static createNull({
    settings = createSettings(),
  }: { settings?: SettingsState } = {}) {
    return new GetCategoriesQueryHandler(
      SettingsProvider.createNull({ readFileResponses: [settings] }),
    );
  }

  readonly #settingsProvider: SettingsProvider;

  private constructor(settingsProvider: SettingsProvider) {
    this.#settingsProvider = settingsProvider;
  }

  async handle(query: GetCategoriesQuery): Promise<GetCategoriesQueryResult> {
    const view = await this.#settingsProvider.load();
    return getCategories(view, query);
  }
}
