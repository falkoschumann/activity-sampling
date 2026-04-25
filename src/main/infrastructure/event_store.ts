// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";
import stream from "node:stream";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse, stringify } from "csv";
import type { Options as ParseOptions } from "csv-parse";
import type { Options as StringifyOptions } from "csv-stringify";
import { stringify as syncStringify } from "csv-stringify/sync";

import { ActivityLoggedEvent } from "../domain/activity_logged_event";

export class EventStore extends EventTarget {
  static create({
    fileName = "data/activity-log.csv",
  }: { fileName?: string } = {}): EventStore {
    return new EventStore(fileName, fsPromise);
  }

  static createNull({
    events,
  }: { events?: ActivityLoggedEvent[] } = {}): EventStore {
    return new EventStore(
      "null-activity-log.csv",
      new FsPromiseStub(events) as unknown as typeof fsPromise,
    );
  }

  fileName: string;

  readonly #fs: typeof fsPromise;

  private constructor(fileName: string, fs: typeof fsPromise) {
    super();
    this.fileName = fileName;
    this.#fs = fs;
  }

  async record(event: ActivityLoggedEvent) {
    const dirName = path.resolve(path.dirname(this.fileName));
    await this.#fs.mkdir(dirName, { recursive: true });

    const existsFile = await this.#existsFile(this.fileName);
    const stringifier = stringify({
      ...STRINGIFY_CONFIGURATION,
      header: !existsFile,
    });
    const file = await this.#fs.open(this.fileName, "a");
    const stream = file.createWriteStream();
    stringifier.pipe(stream);
    stringifier.write(event);
    stringifier.end();

    this.dispatchEvent(new CustomEvent(RECORDED_EVENT, { detail: event }));
  }

  trackRecorded(): OutputTracker {
    return OutputTracker.create(this, RECORDED_EVENT);
  }

  async *replay(): AsyncGenerator<ActivityLoggedEvent> {
    try {
      const file = await this.#fs.open(this.fileName, "r");
      const parser = file.createReadStream().pipe(parse(PARSE_CONFIGURATION));
      for await (const record of parser) {
        const valid = ajv.validate(ACTIVITY_LOGGED_EVENT_SCHEMA, record);
        if (!valid) {
          // TODO write test
          const errors = JSON.stringify(ajv.errors, null, 2);
          throw new TypeError(`Invalid activity logged event data:\n${errors}`);
        }

        yield ActivityLoggedEvent.create(record);
      }
      parser.end();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No events recorded yet
        return;
      }

      throw error;
    }
  }

  async #existsFile(path: string) {
    try {
      await this.#fs.lstat(path);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return false;
      }

      throw error;
    }
  }
}

const RECORDED_EVENT = "recorded";

const PARSE_CONFIGURATION: ParseOptions = {
  cast: (value, context) =>
    value == "" && !context.quoting ? undefined : value,
  columns: (header) =>
    header.map((column) => {
      switch (column) {
        case "Timestamp":
          return "timestamp";
        case "Duration":
          return "duration";
        case "Client":
          return "client";
        case "Project":
          return "project";
        case "Task":
          return "task";
        case "Notes":
          return "notes";
        case "Category":
          return "category";
        default:
          return column;
      }
    }),
};

const STRINGIFY_CONFIGURATION: StringifyOptions = {
  header: true,
  record_delimiter: "\r\n",
  columns: [
    { key: "timestamp", header: "Timestamp" },
    { key: "duration", header: "Duration" },
    { key: "client", header: "Client" },
    { key: "project", header: "Project" },
    { key: "task", header: "Task" },
    { key: "notes", header: "Notes" },
    { key: "category", header: "Category" },
  ],
  cast: {
    object: (value, context) => {
      if (context.column === "timestamp" || context.column === "duration") {
        return value.toString();
      } else {
        return JSON.stringify(value);
      }
    },
  },
};

const ACTIVITY_LOGGED_EVENT_SCHEMA = {
  type: "object",
  properties: {
    timestamp: { type: "string", format: "iso-date-time" },
    duration: { type: "string", format: "duration" },
    client: { type: "string" },
    project: { type: "string" },
    task: { type: "string" },
    notes: { type: "string" },
    category: { type: "string" },
  },
  required: ["timestamp", "duration", "client", "project", "task"],
  additionalProperties: false,
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

class FsPromiseStub {
  readonly createReadStreamResponses: ConfigurableResponses;

  constructor(createReadStreamResponses?: unknown[]) {
    this.createReadStreamResponses = ConfigurableResponses.create(
      createReadStreamResponses ? [createReadStreamResponses] : undefined,
      "filesystem stub",
    );
  }

  async lstat() {}

  async mkdir() {}

  async open() {
    return Promise.resolve(new FileHandleStub(this.createReadStreamResponses));
  }
}

class FileHandleStub {
  #createReadStreamResponses: ConfigurableResponses;

  constructor(createReadStreamResponses: ConfigurableResponses) {
    this.#createReadStreamResponses = createReadStreamResponses;
  }

  createReadStream() {
    const readable = new stream.PassThrough();
    setTimeout(() => {
      const events = this.#createReadStreamResponses.next();
      const record = syncStringify(
        events as unknown[],
        STRINGIFY_CONFIGURATION,
      );
      readable.emit("data", record);
      readable.emit("end");
    }, 0);
    return readable;
  }

  createWriteStream() {
    return {
      emit: () => {},
      end: () => {},
      on: () => {},
      once: () => {},
      write: () => {},
    };
  }
}
