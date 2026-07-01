// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type CommandStatus,
  type EventBus,
  Success,
} from "@muspellheim/shared";

import { LogActivityCommand } from "../../shared/domain/logged-activity/log_activity.command";
import { logActivity } from "../domain/logged-activity/log_activity.command";
import type { EventStore } from "../infrastructure/event_store.ts";

export class LogActivityCommandHandler {
  static create({
    eventBus,
    eventStore,
  }: {
    eventBus: EventBus;
    eventStore: EventStore;
  }) {
    return new LogActivityCommandHandler(eventBus, eventStore);
  }

  readonly #eventBus;
  readonly #eventStore;

  private constructor(eventBus: EventBus, eventStore: EventStore) {
    this.#eventBus = eventBus;
    this.#eventStore = eventStore;
  }

  async handle(command: LogActivityCommand): Promise<CommandStatus> {
    command = LogActivityCommand.create(command.data);
    const events = logActivity(command);
    for (const event of events) {
      this.#eventBus.publish(event);
      await this.#eventStore.record(event);
    }
    return new Success();
  }
}
