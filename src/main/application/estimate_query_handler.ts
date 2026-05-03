// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { Clock } from "../../shared/domain/temporal";
import { EstimateProjection } from "../domain/estimate_projection";
import type { EventStore } from "../infrastructure/event_store";

export class EstimateQueryHandler {
  static create({
    eventStore,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    clock?: Clock;
  }) {
    return new EstimateQueryHandler(eventStore, clock);
  }

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: EstimateQuery): Promise<EstimateQueryResult> {
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const projection = EstimateProjection.create({
      query,
      timeZone,
    });
    for await (const event of replay) {
      projection.update(event);
    }
    return projection.get();
  }
}
