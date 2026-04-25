// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  ReportQuery,
  ReportQueryResult,
} from "../../shared/domain/report_query";
import type { Clock } from "../../shared/domain/temporal";
import { ReportProjection } from "../domain/report_projection";
import type { EventStore } from "../infrastructure/event_store";

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

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

  private constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async handle(query: ReportQuery): Promise<ReportQueryResult> {
    const replay = this.#eventStore.replay();
    const timeZone = query.timeZone || this.#clock.zone;
    const projection = ReportProjection.create({ query, timeZone });
    for await (const event of replay) {
      projection.update(event);
    }
    return projection.get();
  }
}
