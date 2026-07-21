// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";
import Ajv, { type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

import {
  createSettings,
  type SettingsState,
} from "../../shared/domain/settings/settings.aggregate";

export class SettingsProvider extends EventTarget {
  static create({
    filename = "data/settings.json",
  }: { filename?: string } = {}) {
    return new SettingsProvider(filename, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (SettingsState | null | Error)[];
  } = {}) {
    return new SettingsProvider(
      "null-settings.json",
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  filename;

  readonly #fs;

  private constructor(filename: string, fs: typeof fsPromise) {
    super();
    this.filename = filename;
    this.#fs = fs;
  }

  async load(): Promise<SettingsState> {
    try {
      const fileContent = await this.#fs.readFile(this.filename, "utf-8");
      const json = JSON.parse(fileContent);
      validateJson(json);
      return createSettings(json);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No settings stored yet
        return createSettings();
      }

      throw error;
    }
  }

  async store(settings: SettingsState) {
    const dir = path.dirname(this.filename);
    await this.#fs.mkdir(dir, { recursive: true });

    const json = JSON.stringify(settings, null, 2);
    await this.#fs.writeFile(this.filename, json, "utf-8");
    this.dispatchEvent(new CustomEvent("stored", { detail: settings }));
  }

  trackStored(): OutputTracker<SettingsState> {
    return OutputTracker.create(this, "stored");
  }
}

const SCHEMA: JSONSchemaType<SettingsState> = {
  type: "object",
  properties: {
    capacity: { type: "string", format: "duration" },
    categories: { type: "array", items: { type: "string" } },
    firstName: { type: "string", nullable: true },
    lastName: { type: "string", nullable: true },
  },
  required: ["capacity", "categories"],
  additionalProperties: false,
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
  readonly #readFileResponses: ConfigurableResponses<
    SettingsState | null | Error
  >;

  constructor(readFileResponses: (SettingsState | null | Error)[]) {
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
