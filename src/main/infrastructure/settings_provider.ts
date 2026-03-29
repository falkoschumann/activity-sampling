// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { app } from "electron";

import { Settings } from "../../shared/domain/settings";

const STORED_EVENT = "stored";

export interface SettingsConfiguration {
  readonly fileName: string;
}

export class SettingsProvider extends EventTarget {
  static create(
    configuration: SettingsConfiguration = {
      // TODO move app.getPath to entry layer of main process
      fileName: path.join(app.getPath("userData"), "settings.json"),
    },
  ): SettingsProvider {
    return new SettingsProvider(configuration, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (Settings | null | Error)[];
  } = {}): SettingsProvider {
    return new SettingsProvider(
      { fileName: "null-settings.json" },
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  readonly #fileName: string;
  readonly #fs: typeof fsPromise;

  constructor(configuration: SettingsConfiguration, fs: typeof fsPromise) {
    super();
    this.#fileName = configuration.fileName;
    this.#fs = fs;
  }

  async load(): Promise<Settings> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName, "utf-8");
      const json = JSON.parse(fileContent);
      const dto = SettingsDto.fromJson(json);
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

const ajv = new Ajv();
addFormats(ajv);

const schema = {
  type: "object",
  properties: {
    dataDir: { type: "string" },
    capacity: { type: "string", format: "duration" },
  },
};

class SettingsDto {
  static create({
    dataDir,
    capacity,
    categories,
  }: {
    dataDir: string;
    capacity: string;
    categories: string[];
  }): SettingsDto {
    return new SettingsDto(dataDir, capacity, categories);
  }

  static fromModel(model: Settings): SettingsDto {
    return SettingsDto.create({
      dataDir: model.dataDir,
      capacity: model.capacity.toString(),
      categories: model.categories,
    });
  }

  static fromJson(json: unknown): SettingsDto {
    const valid = ajv.validate(schema, json);
    if (valid) {
      return SettingsDto.create(json as SettingsDto);
    }

    throw new TypeError("Invalid settings data.", { cause: ajv.errors });
  }

  readonly dataDir: string;
  readonly capacity: string;
  readonly categories: string[];

  private constructor(dataDir: string, capacity: string, categories: string[]) {
    this.dataDir = dataDir;
    this.capacity = capacity;
    this.categories = categories;
  }

  validate(): Settings {
    return Settings.create(this);
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
