// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "csv";

import { ConfigurableResponses } from "../../shared/common/configurable_responses";
import { OutputTracker } from "../../shared/common/output_tracker";

const RECORDED_EVENT = "recorded";

export class EventStore<T = unknown> extends EventTarget {
  static create<T>({
    fileName = "data/events.csv",
  }: { fileName?: string } = {}): EventStore<T> {
    return new EventStore<T>(fileName, fsPromise);
  }

  static createNull<T>({
    events,
  }: { events?: T[][] | T[] } = {}): EventStore<T> {
    return new EventStore<T>(
      "null-file-csv",
      new FsPromiseStub(events) as unknown as typeof fsPromise,
    );
  }

  readonly #fileName: string;
  #fs: typeof fsPromise;

  constructor(fileName: string, fs: typeof fsPromise) {
    super();
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async record(event: T) {
    const dirName = path.resolve(path.dirname(this.#fileName));
    await this.#fs.mkdir(dirName, { recursive: true });

    const existsFile = await this.#existsFile(this.#fileName);
    const stringifier = stringify({
      header: !existsFile,
      record_delimiter: "\r\n",
    });
    const file = await this.#fs.open(this.#fileName, "a");
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
      const file = await this.#fs.open(this.#fileName, "r");
      const parser = file.createReadStream().pipe(
        parse({
          cast: (value, context) =>
            value == "" && !context.quoting ? undefined : value,
          columns: true,
        }),
      );
      for await (const record of parser) {
        yield record;
      }
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
  readonly #configurableResponses: ConfigurableResponses;

  constructor(events?: unknown[][] | unknown[]) {
    this.#configurableResponses = ConfigurableResponses.create(events);
  }

  async lstat() {}

  async mkdir() {}

  async open() {
    return Promise.resolve(new FileHandleStub(this.#configurableResponses));
  }

  async writeFile() {
    return Promise.resolve();
  }
}

class FileHandleStub {
  #configurableResponses: ConfigurableResponses;

  constructor(configurableResponses: ConfigurableResponses) {
    this.#configurableResponses = configurableResponses;
  }

  createReadStream() {
    return {
      pipe: () => this.#configurableResponses.next(),
    };
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
