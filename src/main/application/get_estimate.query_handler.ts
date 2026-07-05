// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createReport,
  projectReport,
} from "../../shared/domain/report.read_model";
import {
  getEstimate,
  type GetEstimateQuery,
  type GetEstimateQueryResult,
} from "../../shared/domain/get_estimate.query";
import type { EventStore } from "../infrastructure/event_store";

export class GetEstimateQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new GetEstimateQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: GetEstimateQuery): Promise<GetEstimateQueryResult> {
    const { timeZone } = query.data;
    let view = createReport();
    for await (const event of this.#eventStore.replay()) {
      view = projectReport(view, event, { timeZone });
    }
    return getEstimate(view, query);
  }
}
