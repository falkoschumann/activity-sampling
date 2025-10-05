// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";
import stream from "node:stream";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";
import { parse, stringify } from "csv";
import { stringify as syncStringify } from "csv-stringify/sync";

const RECORDED_EVENT = "recorded";

export interface EventStoreConfiguration {
  readonly fileName: string;
}

export class EventStore<T = unknown> extends EventTarget {
  static create<T>(
    configuration: EventStoreConfiguration = {
      fileName: "data/activity-log.csv",
    },
  ): EventStore<T> {
    return new EventStore<T>(configuration, fsPromise);
  }

  static createNull<T>({ events }: { events?: T[] } = {}): EventStore<T> {
    return new EventStore<T>(
      { fileName: "null-activity-log.csv" },
      new FsPromiseStub(events) as unknown as typeof fsPromise,
    );
  }

  fileName: string;

  readonly #fs: typeof fsPromise;

  constructor(configuration: EventStoreConfiguration, fs: typeof fsPromise) {
    super();
    this.fileName = configuration.fileName;
    this.#fs = fs;
  }

  async record(event: T) {
    const dirName = path.resolve(path.dirname(this.fileName));
    await this.#fs.mkdir(dirName, { recursive: true });

    const existsFile = await this.#existsFile(this.fileName);
    const stringifier = stringify({
      header: !existsFile,
      record_delimiter: "\r\n",
      columns: [
        { key: "timestamp", header: "Timestamp" },
        { key: "duration", header: "Duration" },
        { key: "client", header: "Client" },
        { key: "project", header: "Project" },
        { key: "task", header: "Task" },
        { key: "notes", header: "Notes" },
      ],
    });
    const file = await this.#fs.open(this.fileName, "a");
    const stream = file.createWriteStream();
    stringifier.pipe(stream);
    stringifier.write(event);
    stringifier.end();

    this.dispatchEvent(new CustomEvent(RECORDED_EVENT, { detail: event }));
  }

  trackRecorded(): OutputTracker<T> {
    return OutputTracker.create(this, RECORDED_EVENT);
  }

  async *replay(): AsyncGenerator<T> {
    try {
      const file = await this.#fs.open(this.fileName, "r");
      const parser = file.createReadStream().pipe(
        parse({
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
                default:
                  return column;
              }
            }),
        }),
      );
      for await (const record of parser) {
        yield record;
      }
      parser.end();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, no events recorded yet
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

  async writeFile() {}
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
      const record = syncStringify(events as unknown[], { header: true });
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
