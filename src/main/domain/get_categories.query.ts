// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SettingsState } from "./settings/settings.aggregate";
import {
  type GetCategoriesQuery,
  GetCategoriesQueryResult,
} from "../../shared/domain/get_categories.query";

export function getCategories(view: SettingsState, _query: GetCategoriesQuery) {
  return GetCategoriesQueryResult.create({ categories: view.categories });
}
