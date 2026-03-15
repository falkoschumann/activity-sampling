// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type {
  ReportQuery,
  ReportQueryResult,
} from "../../shared/domain/report_query";
import { projectReport } from "../domain/report_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";
import type { Clock } from "../../shared/domain/temporal";

export class ReportQueryHandler {
  static create({
    eventStore,
    clock,
  }: {
    eventStore: EventStore;
    clock: Clock;
  }) {
    return new ReportQueryHandler(eventStore, clock);
  }

  #eventStore: EventStore;
  #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: ReportQuery): Promise<ReportQueryResult> {
    // TODO handle time zone in projection
    // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
    const timeZone = query.timeZone || this.#clock.zone;
    const replay = replayTyped(this.#eventStore.replay(), timeZone);
    return projectReport(replay, query);
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
