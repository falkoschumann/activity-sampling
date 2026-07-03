// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createSettingsChangedEvent,
  type SettingsChangedEvent,
} from "./settings_changed.event";

export interface ChangeSettingsCommand {
  readonly type: "change-settings";
  readonly data: ChangeSettingsCommandData;
}

export type ChangeSettingsCommandData = Readonly<{
  capacity: Temporal.DurationLike;
  categories: string[];
  firstName?: string;
  lastName?: string;
}>;

export function createChangeSettingsCommand({
  capacity,
  categories,
  firstName,
  lastName,
}: {
  capacity: Temporal.DurationLike;
  categories: string[];
  firstName?: string;
  lastName?: string;
}): ChangeSettingsCommand {
  return {
    type: "change-settings",
    data: { capacity, categories, firstName, lastName },
  };
}

export function changeSettings(
  command: ChangeSettingsCommand,
): SettingsChangedEvent[] {
  return [createSettingsChangedEvent(command.data)];
}
