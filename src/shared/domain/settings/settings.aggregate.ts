// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type SettingsState = Readonly<{
  capacity: Temporal.Duration;
  categories: string[];
  firstName?: string;
  lastName?: string;
}>;

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
    capacity: Temporal.Duration.from(capacity),
    categories,
    firstName,
    lastName,
  };
}

export function createTestSettings({
  capacity = "PT32H",
  categories = ["", "Feature", "Rework", "Training"],
  firstName = "John",
  lastName = "Doe",
}: {
  capacity?: Temporal.DurationLike;
  categories?: string[];
  firstName?: string;
  lastName?: string;
} = {}): SettingsState {
  return createSettings({ capacity, categories, firstName, lastName });
}
