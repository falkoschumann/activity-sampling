// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createReport,
  projectReport,
} from "../../shared/domain/read_models/report.read_model";
import {
  getCategories,
  type GetCategoriesQuery,
  type GetCategoriesQueryResult,
} from "../../shared/domain/read_models/get_categories.query";
import type { EventStore } from "../infrastructure/event_store";

export class GetCategoriesQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new GetCategoriesQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: GetCategoriesQuery): Promise<GetCategoriesQueryResult> {
    const timeZone = Temporal.Now.timeZoneId();
    let view = createReport();
    for await (const event of this.#eventStore.replay()) {
      view = projectReport(view, event, { timeZone });
    }
    return getCategories(view, query);
  }
}
