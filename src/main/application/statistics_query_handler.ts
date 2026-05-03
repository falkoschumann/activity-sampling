// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  StatisticsQuery,
  StatisticsQueryResult,
} from "../../shared/domain/statistics_query";
import { Clock } from "../../shared/domain/temporal";
import { StatisticsProjection } from "../domain/statistics_projection";
import type { EventStore } from "../infrastructure/event_store";

export class StatisticsQueryHandler {
  static create({
    eventStore,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    clock?: Clock;
  }) {
    return new StatisticsQueryHandler(eventStore, clock);
  }

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: StatisticsQuery): Promise<StatisticsQueryResult> {
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const projection = StatisticsProjection.create({
      query,
      timeZone,
    });
    for await (const event of replay) {
      projection.update(event);
    }
    return projection.get();
  }
}
