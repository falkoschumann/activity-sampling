// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  StatisticsQuery,
  StatisticsQueryResult,
} from "../../shared/domain/statistics_query";
import { projectReport, queryStatistics } from "../domain/report_read_model";
import type { EventStore } from "../infrastructure/event_store";

export class StatisticsQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new StatisticsQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: StatisticsQuery): Promise<StatisticsQueryResult> {
    let readModel;
    for await (const event of this.#eventStore.replay()) {
      readModel = projectReport(readModel, event);
    }

    return queryStatistics(readModel, query);
  }
}
