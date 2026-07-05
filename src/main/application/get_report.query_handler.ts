// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createReport,
  projectReport,
} from "../../shared/domain/read_models/report.read_model";
import {
  getReport,
  type GetReportQuery,
  type GetReportQueryResult,
} from "../../shared/domain/read_models/get_report.query";
import type { EventStore } from "../infrastructure/event_store";

export class GetReportQueryHandler {
  static create({ eventStore }: { eventStore: EventStore }) {
    return new GetReportQueryHandler(eventStore);
  }

  readonly #eventStore;

  private constructor(eventStore: EventStore) {
    this.#eventStore = eventStore;
  }

  async handle(query: GetReportQuery): Promise<GetReportQueryResult> {
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
    return getReport(view, query);
  }
}
