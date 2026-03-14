// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/domain/temporal";
import type {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/recent_activities_query";
import { projectRecentActivities } from "../domain/recent_activities_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";

export class RecentActivitiesQueryHandler {
  static create({
    eventStore,
    clock,
  }: {
    eventStore: EventStore;
    clock: Clock;
  }) {
    return new RecentActivitiesQueryHandler(eventStore, clock);
  }

  #eventStore: EventStore;
  #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    // TODO handle time zone in projection
    // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
    const timeZone = query.timeZone || this.#clock.zone;
    const replay = replayTyped(this.#eventStore.replay(), timeZone);
    return projectRecentActivities(replay, {
      ...query,
      today:
        query.today ??
        this.#clock
          .instant()
          .toZonedDateTimeISO(this.#clock.zone)
          .toPlainDate(),
      timeZone: query.timeZone ?? this.#clock.zone,
    });
  }
}

async function* replayTyped(
  events: AsyncGenerator,
  timeZone: Temporal.TimeZoneLike,
) {
  for await (const e of events) {
    yield ActivityLoggedEventDto.fromJson(e).validate(timeZone);
  }
}
