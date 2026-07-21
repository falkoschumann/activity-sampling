// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { OutputTracker } from "@muspellheim/shared";
import { type Options as StringifyOptions, stringify } from "csv-stringify";
import type { TimesheetExportedEvent } from "../../shared/domain/activity/timesheet_exported.event";

export class TimesheetExporterGateway extends EventTarget {
  static create() {
    return new TimesheetExporterGateway(fsPromise);
  }

  static createNull() {
    return new TimesheetExporterGateway(
      new FsPromiseStub() as unknown as typeof fsPromise,
    );
  }

  readonly #fs: typeof fsPromise;

  private constructor(fs: typeof fsPromise) {
    super();
    this.#fs = fs;
  }

  async exportTimesheet(event: TimesheetExportedEvent) {
    const { filename, timesheets } = event.data;
    const dirName = path.resolve(path.dirname(filename));
    await this.#fs.mkdir(dirName, { recursive: true });

    const fileContent = stringify(
      event.data.timesheets,
      STRINGIFY_CONFIGURATION,
    );
    await this.#fs.writeFile(filename, fileContent);

    this.dispatchEvent(new CustomEvent("exported", { detail: timesheets }));
  }

  trackExported() {
    return OutputTracker.create(this, "exported");
  }
}

const STRINGIFY_CONFIGURATION: StringifyOptions = {
  header: true,
  record_delimiter: "\r\n",
  columns: [
    { key: "date", header: "Date" },
    { key: "client", header: "Client" },
    { key: "project", header: "Project" },
    { key: "task", header: "Task" },
    { key: "notes", header: "Notes" },
    { key: "hours", header: "Hours" },
    { key: "firstName", header: "First name" },
    { key: "lastName", header: "Last name" },
  ],
};

class FsPromiseStub {
  async mkdir() {}

  async writeFile() {}
}
