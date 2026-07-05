// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createReport,
  projectReport,
} from "../../shared/domain/report.read_model";
import {
  getStatistics,
  type GetStatisticsQuery,
  type GetStatisticsQueryResult,
} from "../../shared/domain/get_statistics.query";
import type { EventStore } from "../infrastructure/event_store";

export class GetStatisticsQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new GetStatisticsQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: GetStatisticsQuery): Promise<GetStatisticsQueryResult> {
    const { timeZone } = query.data;
    let view = createReport();
    for await (const event of this.#eventStore.replay()) {
      view = projectReport(view, event, { timeZone });
    }
    return getStatistics(view, query);
  }
}
