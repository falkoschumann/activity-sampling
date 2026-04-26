// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { Settings } from "../../shared/domain/settings";

const STORED_EVENT = "stored";

export class SettingsProvider extends EventTarget {
  static create({
    fileName = "data/settings.json",
  }: { fileName?: string } = {}): SettingsProvider {
    return new SettingsProvider(fileName, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (Settings | null | Error)[];
  } = {}): SettingsProvider {
    return new SettingsProvider(
      "null-settings.json",
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  readonly #fileName: string;
  readonly #fs: typeof fsPromise;

  private constructor(fileName: string, fs: typeof fsPromise) {
    super();
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async load(): Promise<Settings> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName, "utf-8");
      const json = JSON.parse(fileContent);
      validateJson(json);
      const dto = Settings.create(json);
      return Settings.create(dto);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No settings stored yet
        return Settings.create();
      }

      throw error;
    }
  }

  async store(settings: Settings) {
    const dir = path.dirname(this.#fileName);
    await this.#fs.mkdir(dir, { recursive: true });

    const json = JSON.stringify(settings, null, 2);
    await this.#fs.writeFile(this.#fileName, json, "utf-8");
    this.dispatchEvent(new CustomEvent(STORED_EVENT, { detail: settings }));
  }

  trackStored(): OutputTracker<Settings> {
    return OutputTracker.create(this, STORED_EVENT);
  }
}

const SCHEMA = {
  type: "object",
  properties: {
    dataDir: { type: "string" },
    capacity: { type: "string", format: "duration" },
  },
};

const ajv = new Ajv();
addFormats(ajv);

function validateJson(record: unknown) {
  const ajv = new Ajv();
  addFormats(ajv);
  const valid = ajv.validate(SCHEMA, record);
  if (!valid) {
    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid settings data:\n${errors}`);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<Settings | null | Error>;

  constructor(readFileResponses: (Settings | null | Error)[]) {
    this.#readFileResponses = ConfigurableResponses.create(
      readFileResponses,
      "read file",
    );
  }

  async mkdir() {}

  async readFile() {
    const response = this.#readFileResponses.next();
    if (response === null) {
      throw { code: "ENOENT" };
    }
    if (response instanceof Error) {
      throw response;
    }

    const s = JSON.stringify(response);
    return Promise.resolve(s);
  }

  async writeFile() {}
}
