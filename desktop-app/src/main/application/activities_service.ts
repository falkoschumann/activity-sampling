// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { Clock } from "../common/clock";
import { type CommandStatus, createSuccess } from "../common/messages";
import {
  createActivity,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
} from "../domain/activities";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEvent } from "../infrastructure/events";

export class ActivitiesService {
  static create({ eventStore = EventStore.create() }): ActivitiesService {
    return new ActivitiesService(eventStore, Clock.create());
  }

  static createNull({
    eventStore = EventStore.createNull(),
    fixedInstant,
  }: {
    eventStore?: EventStore;
    fixedInstant?: Temporal.Instant | string;
  } = {}): ActivitiesService {
    return new ActivitiesService(eventStore, Clock.createNull(fixedInstant));
  }

  #eventStore: EventStore;
  #clock: Clock;

  constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const event = ActivityLoggedEvent.create(command);
    await this.#eventStore.record(event);
    return createSuccess();
  }

  async queryRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const projection = new RecentActivitiesProjection(query, this.#clock);
    const replay = this.#eventStore.replay();
    return projection.project(replay);
  }
}

class RecentActivitiesProjection {
  #timeZone?: string;

  constructor(query: RecentActivitiesQuery, _clock: Clock) {
    this.#timeZone = query.timeZone;
  }
  async project(
    events: AsyncGenerator<unknown>,
  ): Promise<RecentActivitiesQueryResult> {
    let lastEvent: ActivityLoggedEvent | undefined;
    for await (const event of events) {
      // TODO handle type error
      lastEvent = ActivityLoggedEvent.from(event);
    }
    const timeZone = this.#timeZone ?? Temporal.Now.timeZoneId();
    const lastActivity =
      lastEvent &&
      createActivity({
        ...lastEvent,
        dateTime: Temporal.Instant.from(lastEvent.timestamp).toString({
          timeZone,
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
