// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type CommandStatus,
  type EventBus,
  Success,
} from "@muspellheim/shared";

import { ExportTimesheetCommand } from "../../shared/domain/logged-activity/export_timesheet.command";
import { exportTimesheet } from "../domain/logged-activity/export_timesheet.command";
import type { SettingsProvider } from "../infrastructure/settings.provider";

export class ExportTimesheetCommandHandler {
  static create({
    eventBus,
    settingsProvider,
  }: {
    eventBus: EventBus;
    settingsProvider: SettingsProvider;
  }) {
    return new ExportTimesheetCommandHandler(eventBus, settingsProvider);
  }

  readonly #eventBus;
  readonly #settingsProvider;

  private constructor(eventBus: EventBus, settingsProvider: SettingsProvider) {
    this.#eventBus = eventBus;
    this.#settingsProvider = settingsProvider;
  }

  async handle(command: ExportTimesheetCommand): Promise<CommandStatus> {
    command = ExportTimesheetCommand.create(command.data);
    const settings = await this.#settingsProvider.load();
    const events = exportTimesheet(settings, command);
    events.forEach((event) => this.#eventBus.publish(event));
    return new Success();
  }
}
