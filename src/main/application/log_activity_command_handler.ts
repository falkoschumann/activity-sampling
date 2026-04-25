// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import { LogActivityCommand } from "../../shared/domain/log_activity_command";
import { ActivityLoggedEvent } from "../domain/activity_logged_event";
import type { EventStore } from "../infrastructure/event_store.ts";

export class LogActivityCommandHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new LogActivityCommandHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(command: LogActivityCommand): Promise<CommandStatus> {
    const event = ActivityLoggedEvent.create({
      ...command,
      timestamp: command.timestamp.round("seconds"),
      duration: command.duration.round("minutes"),
    });
    await this.#eventStore.record(event);
    return new Success();
  }
}
