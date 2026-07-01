// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createReport, projectReport } from "../domain/report.read_model";
import {
  GetReportQuery,
  type GetReportQueryResult,
} from "../../shared/domain/get_report.query";
import { getReport } from "../domain/get_report.query";
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
    query = GetReportQuery.create(query.data);
    const { from: fromDate, to: toDate, timeZone } = query.data;
    const from = fromDate?.toZonedDateTime(timeZone).startOfDay();
    const to = toDate?.add("P1D").toZonedDateTime(timeZone).startOfDay();
    let view = createReport();
    for await (const event of this.#eventStore.replay({ from, to })) {
      view = projectReport(view, event, { timeZone });
    }
    return getReport(view, query);
  }
}
