// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Clock } from "../../shared/common/temporal";
import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { projectBurnUp } from "../domain/burn_up_projection";
import type { EventStore } from "../infrastructure/event_store";
import { Temporal } from "@js-temporal/polyfill";
import { ActivityLoggedEventDto } from "../infrastructure/events";

export class BurnUpQueryHandler {
  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: BurnUpQuery): Promise<BurnUpQueryResult> {
    const replay = this.#replayTyped(this.#eventStore.replay(), query.timeZone);
    return projectBurnUp(replay, query);
  }

  async *#replayTyped(
    events: AsyncGenerator,
    timeZone?: Temporal.TimeZoneLike,
  ) {
    for await (const e of events) {
      yield ActivityLoggedEventDto.fromJson(e).validate(
        timeZone || this.#clock.zone,
      );
    }
  }
}
