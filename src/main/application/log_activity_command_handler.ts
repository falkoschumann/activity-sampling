// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import { LogActivityCommand } from "../../shared/domain/log_activity_command";
import { ActivityLoggedEventDto } from "../infrastructure/events";
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
    const event = ActivityLoggedEventDto.create({
      ...command,
      timestamp: command.timestamp.toString({ smallestUnit: "seconds" }),
      duration: command.duration.toString(),
    });
    await this.#eventStore.record(event);
    return new Success();
  }
}
