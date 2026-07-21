// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface SettingsState {
  readonly capacity: Temporal.DurationLike;
  readonly categories: string[];
  readonly firstName?: string;
  readonly lastName?: string;
}

export function createSettings({
  capacity = "PT40H",
  categories = ["", "Feature", "Rework"],
  firstName,
  lastName,
}: {
  capacity?: Temporal.DurationLike;
  categories?: string[];
  firstName?: string;
  lastName?: string;
} = {}): SettingsState {
  return {
    capacity: Temporal.Duration.from(capacity).toString(),
    categories,
    firstName,
    lastName,
  };
}
