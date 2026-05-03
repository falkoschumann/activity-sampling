// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { Clock } from "../../shared/domain/temporal";
import { BurnUpProjection } from "../domain/burn_up_projection";
import type { EventStore } from "../infrastructure/event_store";

export class BurnUpQueryHandler {
  static create({
    eventStore,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    clock?: Clock;
  }) {
    return new BurnUpQueryHandler(eventStore, clock);
  }

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: BurnUpQuery): Promise<BurnUpQueryResult> {
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const projection = BurnUpProjection.create({ query, timeZone });
    for await (const event of replay) {
      projection.update(event);
    }
    return projection.get();
  }
}
