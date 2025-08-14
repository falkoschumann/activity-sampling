// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { LogActivityCommand } from "../../shared/domain/activities";
import {
  type CommandStatus,
  createSuccess,
} from "../../shared/domain/messages";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEvent } from "../infrastructure/events";

export class ActivitiesService {
  static create({ eventStore = EventStore.create() }): ActivitiesService {
    return new ActivitiesService(eventStore);
  }

  static createNull({
    eventStore = EventStore.createNull(),
  }): ActivitiesService {
    return new ActivitiesService(eventStore);
  }

  #eventStore: EventStore;

  constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const event = new ActivityLoggedEvent(command);
    await this.#eventStore.record(event);
    return createSuccess();
  }
}
