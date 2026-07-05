// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SettingsState } from "../settings/settings.aggregate";

export interface GetSettingsQuery {
  readonly type: "get-settings";
  readonly data: GetSettingsQueryData;
}

export type GetSettingsQueryData = null;

export function createGetSettingsQuery(data = null): GetSettingsQuery {
  return {
    type: "get-settings",
    data,
  };
}

export interface GetSettingsQueryResult {
  readonly capacity: Temporal.DurationLike;
  readonly categories: string[];
  readonly firstName?: string;
  readonly lastName?: string;
}

export function createGetSettingsQueryResult({
  capacity = "PT40H",
  categories = ["", "Feature", "Rework"],
  firstName,
  lastName,
}: {
  capacity?: Temporal.DurationLike | string;
  categories?: string[];
  firstName?: string;
  lastName?: string;
} = {}): GetSettingsQueryResult {
  return { capacity, categories, firstName, lastName };
}

export function getSettings(view: SettingsState, _query: GetSettingsQuery) {
  return createGetSettingsQueryResult(view);
}
