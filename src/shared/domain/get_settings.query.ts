// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { SettingsState } from "./settings/settings.aggregate";

export class GetSettingsQuery {
  static create(_data = null) {
    return new GetSettingsQuery();
  }

  readonly type = "get-settings";
  readonly data = null;

  private constructor() {}
}

export class GetSettingsQueryResult {
  static create({
    capacity = "PT40H",
    categories = ["", "Feature", "Rework"],
    firstName,
    lastName,
  }: {
    capacity?: Temporal.DurationLike | string;
    categories?: string[];
    firstName?: string;
    lastName?: string;
  } = {}) {
    return new GetSettingsQueryResult(
      capacity,
      categories,
      firstName,
      lastName,
    );
  }

  static createTestInstance({
    capacity = "PT32H",
    categories = ["", "Feature", "Rework", "Training"],
    firstName = "John",
    lastName = "Doe",
  }: {
    capacity?: Temporal.DurationLike | string;
    categories?: string[];
    firstName?: string;
    lastName?: string;
  } = {}) {
    return GetSettingsQueryResult.create({
      capacity,
      categories,
      firstName,
      lastName,
    });
  }

  readonly capacity;
  readonly categories;
  readonly firstName;
  readonly lastName;

  private constructor(
    capacity: Temporal.DurationLike | string,
    categories: string[],
    firstName?: string,
    lastName?: string,
  ) {
    this.capacity = Temporal.Duration.from(capacity);
    this.categories = categories;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export function getSettings(view: SettingsState, _query: GetSettingsQuery) {
  return GetSettingsQueryResult.create(view);
}
