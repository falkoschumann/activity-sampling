// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/domain/temporal";
import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { projectBurnUp } from "../domain/burn_up_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";

export class BurnUpQueryHandler {
  static create({
    eventStore,
    clock,
  }: {
    eventStore: EventStore;
    clock: Clock;
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
    // TODO handle time zone in projection
    // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
    const timeZone = query.timeZone || this.#clock.zone;
    const replay = replayTyped(this.#eventStore.replay(), timeZone);
    return projectBurnUp(replay, query);
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
