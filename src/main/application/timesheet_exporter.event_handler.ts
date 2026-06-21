// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventBus } from "@muspellheim/shared";

import { TimesheetExportedEvent } from "../domain/logged-activity/timesheet_exported.event";
import type { TimesheetExporterGateway } from "../infrastructure/timesheet_exporter.gateway";

export class TimesheetExportEventHandler {
  static create({
    eventBus,
    timesheetExporter,
  }: {
    eventBus: EventBus;
    timesheetExporter: TimesheetExporterGateway;
  }) {
    return new TimesheetExportEventHandler(eventBus, timesheetExporter);
  }

  readonly #timesheetExporter;

  private constructor(
    eventBus: EventBus,
    timesheetExporter: TimesheetExporterGateway,
  ) {
    this.#timesheetExporter = timesheetExporter;

    eventBus.subscribe((event: TimesheetExportedEvent) => this.#handle(event));
  }

  async #handle(event: TimesheetExportedEvent) {
    if (event.type === "timesheet-exported") {
      await this.#timesheetExporter.exportTimesheet(event);
    }
  }
}
