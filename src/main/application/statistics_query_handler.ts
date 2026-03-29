// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/domain/temporal";
import type {
  StatisticsQuery,
  StatisticsQueryResult,
} from "../../shared/domain/statistics_query";
import { projectStatistics } from "../domain/statistics_projection";
import { ActivityLoggedEventDto } from "../infrastructure/activity_logged_event_dto";
import type { EventStore } from "../infrastructure/event_store";

export class StatisticsQueryHandler {
  static create({
    eventStore,
    clock,
  }: {
    eventStore: EventStore;
    clock: Clock;
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
    // TODO handle time zone in projection
    // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
    const timeZone = query.timeZone || this.#clock.zone;
    const replay = replayTyped(this.#eventStore.replay(), timeZone);
    return projectStatistics(replay, {
      ...query,
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
