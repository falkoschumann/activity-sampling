// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";

import {
  changeSettings,
  type ChangeSettingsCommand,
} from "../../shared/domain/settings/change_settings.command";
import type { SettingsProvider } from "../infrastructure/settings.provider";

export class ChangeSettingsCommandHandler {
  static create({
    eventBus,
    settingsProvider,
  }: {
    eventBus: EventBus;
    settingsProvider: SettingsProvider;
  }) {
    return new ChangeSettingsCommandHandler(eventBus, settingsProvider);
  }

  #eventBus;
  #settingsProvider;

  private constructor(eventBus: EventBus, settingsProvider: SettingsProvider) {
    this.#eventBus = eventBus;
    this.#settingsProvider = settingsProvider;
  }

  async handle(command: ChangeSettingsCommand) {
    const events = changeSettings(command);
    for (const event of events) {
      await this.#settingsProvider.store(event.data);
      this.#eventBus.publish(event);
    }
    return new Success();
  }
}
