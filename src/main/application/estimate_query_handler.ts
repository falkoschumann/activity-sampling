// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/domain/temporal";
import type {
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { projectEstimate } from "../domain/estimate_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";

export class EstimateQueryHandler {
  static create({
    eventStore,
    clock,
  }: {
    eventStore: EventStore;
    clock: Clock;
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
    // TODO handle time zone in projection
    // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
    const timeZone = query.timeZone || this.#clock.zone;
    const replay = replayTyped(this.#eventStore.replay(), timeZone);
    return projectEstimate(replay, query);
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
