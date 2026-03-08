// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { OutputTracker } from "@muspellheim/shared";
import { stringify } from "csv/sync";

export class TimesheetExporter extends EventTarget {
  static create(): TimesheetExporter {
    return new TimesheetExporter(fsPromise);
  }

  static createNull(): TimesheetExporter {
    return new TimesheetExporter(
      new FsPromiseStub() as unknown as typeof fsPromise,
    );
  }

  readonly #fs: typeof fsPromise;

  private constructor(fs: typeof fsPromise) {
    super();
    this.#fs = fs;
  }

  async exportTimesheet(timesheets: TimesheetDto[], fileName: string) {
    const dirName = path.resolve(path.dirname(fileName));
    await this.#fs.mkdir(dirName, { recursive: true });

    const fileContent = stringify(timesheets, {
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
    });
    this.#fs.writeFile(fileName, fileContent);

    this.dispatchEvent(new CustomEvent("exported", { detail: timesheets }));
  }

  trackExported() {
    return OutputTracker.create(this, "exported");
  }
}

export class TimesheetDto {
  static create({
    date,
    client,
    project,
    task,
    notes,
    hours,
    firstName,
    lastName,
  }: {
    date: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    hours: number;
    firstName: string;
    lastName: string;
  }): TimesheetDto {
    return new TimesheetDto(
      date,
      client,
      project,
      task,
      hours,
      firstName,
      lastName,
      notes,
    );
  }

  static createTestInstance({
    date = "2025-06-04",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    hours = 2,
    firstName = "John",
    lastName = "Doe",
  }: {
    date?: string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    hours?: number;
    firstName?: string;
    lastName?: string;
  } = {}): TimesheetDto {
    return TimesheetDto.create({
      date,
      client,
      project,
      task,
      notes,
      hours,
      firstName,
      lastName,
    });
  }

  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly hours: number;
  readonly firstName: string;
  readonly lastName: string;

  constructor(
    date: string,
    client: string,
    project: string,
    task: string,
    hours: number,
    firstName: string,
    lastName: string,
    notes?: string,
  ) {
    this.date = date;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.hours = hours;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

class FsPromiseStub {
  async mkdir() {}

  async writeFile() {}
}
