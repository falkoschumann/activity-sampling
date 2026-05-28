// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  ReportQuery,
  ReportQueryResult,
} from "../../shared/domain/report_query";
import { Clock, isTimestampInPeriod } from "../../shared/domain/temporal";
import type { EventStore } from "../infrastructure/event_store";
import { ReportReadModel } from "../domain/report_read_model";

export class ReportQueryHandler {
  static create({
    eventStore,
    clock = Clock.systemDefaultZone(),
  }: {
    eventStore: EventStore;
    clock?: Clock;
  }) {
    return new ReportQueryHandler(eventStore, clock);
  }

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: ReportQuery): Promise<ReportQueryResult> {
    const readModel = new ReportReadModel();
    const timeZone = query.timeZone || this.#clock.zone;
    for await (const event of this.#eventStore.replay()) {
      if (
        isTimestampInPeriod(event.timestamp, timeZone, query.from, query.to)
      ) {
        readModel.project(event);
      }
    }
    return readModel.queryReport({
      scope: query.scope,
      from: query.from,
      to: query.to,
      timeZone,
    });
  }
}
