// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface SettingsChangedEvent {
  readonly type: "change-settings";
  readonly data: SettingsChangedEventData;
}

export type SettingsChangedEventData = Readonly<{
  capacity: Temporal.DurationLike;
  categories: string[];
  firstName?: string;
  lastName?: string;
}>;

export function createSettingsChangedEvent({
  capacity,
  categories,
  firstName,
  lastName,
}: {
  capacity: Temporal.DurationLike;
  categories: string[];
  firstName?: string;
  lastName?: string;
}): SettingsChangedEvent {
  return {
    type: "change-settings",
    data: { capacity, categories, firstName, lastName },
  };
}
