// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import type { EventStore } from "../infrastructure/event_store";
import { queryBurnUp } from "../domain/burn_up_query";
import { projectReport } from "../domain/report_read_model";

export class BurnUpQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new BurnUpQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: BurnUpQuery): Promise<BurnUpQueryResult> {
    let readModel;
    for await (const event of this.#eventStore.replay()) {
      readModel = projectReport(readModel, event);
    }
    return queryBurnUp(readModel, query);
  }
}
