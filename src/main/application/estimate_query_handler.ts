// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type {
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { projectReport } from "../domain/report_read_model";
import { queryEstimate } from "../domain/estimate_query";
import type { EventStore } from "../infrastructure/event_store";

export class EstimateQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new EstimateQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: EstimateQuery): Promise<EstimateQueryResult> {
    let readModel;
    for await (const event of this.#eventStore.replay()) {
      readModel = projectReport(readModel, event);
    }
    return queryEstimate(readModel, query);
  }
}
