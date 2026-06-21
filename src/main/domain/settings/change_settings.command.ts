// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ChangeSettingsCommand } from "../../../shared/domain/settings/change_settings.command";
import { SettingsChangedEvent } from "./settings_changed.event";

export function changeSettings(
  command: ChangeSettingsCommand,
): SettingsChangedEvent[] {
  return [SettingsChangedEvent.create(command.data)];
}
