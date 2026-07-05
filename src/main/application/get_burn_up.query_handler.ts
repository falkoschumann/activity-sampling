// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  getBurnUp,
  type GetBurnUpQuery,
  type GetBurnUpQueryResult,
} from "../../shared/domain/get_burn_up.query";
import {
  createReport,
  projectReport,
} from "../../shared/domain/report.read_model";
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
    const timeZone = query.data.timeZone;
    const fromDate = query.data.from
      ? Temporal.PlainDate.from(query.data.from)
      : undefined;
    const from = fromDate?.toZonedDateTime(timeZone).startOfDay();
    const toDate = query.data.to
      ? Temporal.PlainDate.from(query.data.to)
      : undefined;
    const to = toDate?.add("P1D").toZonedDateTime(timeZone).startOfDay();
    let view = createReport();
    for await (const event of this.#eventStore.replay({ from, to })) {
      view = projectReport(view, event, { timeZone });
    }
    return getBurnUp(view, query);
  }
}
