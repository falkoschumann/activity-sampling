// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventBus } from "@muspellheim/shared";

import type { TimesheetExportedEvent } from "../../shared/domain/activity/timesheet_exported.event";
import type { TimesheetExporterGateway } from "../infrastructure/timesheet_exporter.gateway";

export class TimesheetExportEventHandler {
  static create({
    eventBus,
    timesheetExporterGateway,
  }: {
    eventBus: EventBus;
    timesheetExporterGateway: TimesheetExporterGateway;
  }) {
    return new TimesheetExportEventHandler(eventBus, timesheetExporterGateway);
  }

  readonly #timesheetExporterGateway;

  private constructor(
    eventBus: EventBus,
    timesheetExporterGateway: TimesheetExporterGateway,
  ) {
    this.#timesheetExporterGateway = timesheetExporterGateway;

    eventBus.subscribe((event: TimesheetExportedEvent) => this.#handle(event));
  }

  async #handle(event: TimesheetExportedEvent) {
    if (event.type === "timesheet-exported") {
      await this.#timesheetExporterGateway.exportTimesheet(event);
    }
  }
}
