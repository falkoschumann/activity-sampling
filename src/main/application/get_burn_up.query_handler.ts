// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  GetBurnUpQuery,
  GetBurnUpQueryResult,
} from "../../shared/domain/get_burn_up.query";
import { getBurnUp } from "../domain/get_burn_up.query";
import { createReport, projectReport } from "../domain/report.read_model";
import type { EventStore } from "../infrastructure/event_store";

export class GetBurnUpQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new GetBurnUpQueryHandler(eventStore);
  }

  readonly #eventStore: EventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: GetBurnUpQuery): Promise<GetBurnUpQueryResult> {
    query = GetBurnUpQuery.create(query.data);
    const { from: fromDate, to: toDate, timeZone } = query.data;
    const from = fromDate.toZonedDateTime(timeZone).startOfDay();
    const to = toDate.add("P1D").toZonedDateTime(timeZone).startOfDay();
    let view = createReport();
    for await (const event of this.#eventStore.replay({ from, to })) {
      view = projectReport(view, event, { timeZone });
    }
    return getBurnUp(view, query);
  }
}
