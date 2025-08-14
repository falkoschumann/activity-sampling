// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  createActivity,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
} from "../domain/activities";
import { type CommandStatus, createSuccess } from "../common/messages";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEvent } from "../infrastructure/events";
import { Temporal } from "@js-temporal/polyfill";

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
    const event = ActivityLoggedEvent.create(command);
    await this.#eventStore.record(event);
    return createSuccess();
  }

  async queryRecentActivities(
    _query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const replay = this.#eventStore.replay();
    let lastEvent: ActivityLoggedEvent | undefined;
    for await (const event of replay) {
      // TODO handle type error
      lastEvent = ActivityLoggedEvent.from(event);
    }
    const lastActivity =
      lastEvent &&
      createActivity({
        ...lastEvent,
        dateTime: Temporal.Instant.from(lastEvent.timestamp).toString({
          timeZone: Temporal.Now.timeZoneId(),
        }),
      });

    return {
      lastActivity,
      workingDays: [],
      timeSummary: {
        hoursToday: "PT0S",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT0S",
        hoursThisMonth: "PT0S",
      },
    };
  }
}
