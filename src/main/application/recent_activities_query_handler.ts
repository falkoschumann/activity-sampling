// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Clock } from "../../shared/domain/temporal";
import type { RecentActivitiesQuery, RecentActivitiesQueryResult } from "../../shared/domain/recent_activities_query";
import type { EventStore } from "../infrastructure/event_store";
import { RecentActivitiesProjection } from "../domain/recent_activities_projection";

export class RecentActivitiesQueryHandler {
  static create({
    eventStore,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    clock?: Clock;
  }) {
    return new RecentActivitiesQueryHandler(eventStore, clock);
  }

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const today = this.#clock
      .instant()
      .toZonedDateTimeISO(timeZone ?? this.#clock.zone)
      .toPlainDate();
    const projection = RecentActivitiesProjection.create({
      query,
      today,
      timeZone,
    });
    for await (const event of replay) {
      projection.update(event);
    }
    return projection.get();
  }
}
