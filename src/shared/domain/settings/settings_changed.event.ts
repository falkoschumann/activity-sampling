// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface SettingsChangedEvent {
  readonly type: "change-settings";
  readonly data: SettingsChangedEventData;
}

export interface SettingsChangedEventData {
  readonly capacity: Temporal.DurationLike;
  readonly categories: string[];
  readonly firstName?: string;
  readonly lastName?: string;
}

export function createSettingsChangedEvent({
  capacity = "PT40H",
  categories = ["", "Feature", "Rework"],
  firstName,
  lastName,
}: {
  capacity?: Temporal.DurationLike;
  categories?: string[];
  firstName?: string;
  lastName?: string;
} = {}): SettingsChangedEvent {
  return {
    type: "change-settings",
    data: { capacity, categories, firstName, lastName },
  };
}
