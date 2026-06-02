// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  ReportQuery,
  ReportQueryResult,
} from "../../shared/domain/report_query";
import { isTimestampInPeriod } from "../../shared/domain/temporal";
import { projectReport } from "../domain/report_read_model";
import { queryReport } from "../domain/report_query";
import type { EventStore } from "../infrastructure/event_store";

export class ReportQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new ReportQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: ReportQuery): Promise<ReportQueryResult> {
    let readModel;
    for await (const event of this.#eventStore.replay()) {
      if (
        isTimestampInPeriod(
          event.timestamp,
          query.timeZone,
          query.from,
          query.to,
        )
      ) {
        readModel = projectReport(readModel, event);
      }
    }

    return queryReport(readModel, query);
  }
}
