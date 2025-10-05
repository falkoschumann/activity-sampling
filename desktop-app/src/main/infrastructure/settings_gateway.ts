// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { app } from "electron";

export class Settings {
  static create(settings: Settings = {}): Settings {
    return new Settings(settings.dataDir);
  }

  dataDir?: string;

  private constructor(dataDir?: string) {
    this.dataDir = dataDir;
  }
}

export class SettingsConfiguration {
  static create(configuration: SettingsConfiguration): SettingsConfiguration {
    return new SettingsConfiguration(configuration.fileName);
  }

  static createDefault(): SettingsConfiguration {
    const file = path.join(app.getPath("userData"), "settings.json");
    return new SettingsConfiguration(file);
  }

  fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }
}

export class SettingsGateway {
  static create(configuration: SettingsConfiguration): SettingsGateway {
    return new SettingsGateway(configuration);
  }

  readonly #configuration: SettingsConfiguration;

  constructor(configuration: SettingsConfiguration) {
    this.#configuration = configuration;
  }

  async load(): Promise<Settings> {
    try {
      const fileContent = await fs.readFile(
        this.#configuration.fileName,
        "utf-8",
      );
      const json = JSON.parse(fileContent);
      return SettingsDto.fromJson(json).validate();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, no events recorded yet
        return {};
      }

      throw error;
    }
  }

  async store(settings: Settings) {
    const dir = path.dirname(this.#configuration.fileName);
    await fs.mkdir(dir, { recursive: true });
    const json = JSON.stringify(settings, null, 2);
    await fs.writeFile(this.#configuration.fileName, json, "utf-8");
  }
}

const schema = {
  type: "object",
  properties: {
    dataDir: { type: "string" },
  },
  additionalProperties: false,
};

export class SettingsDto {
  static create({ dataDir }: { dataDir?: string } = {}): SettingsDto {
    return new SettingsDto(dataDir);
  }

  static fromJson(json: unknown): SettingsDto {
    const ajv = new Ajv();
    addFormats(ajv);
    const valid = ajv.validate(schema, json);
    if (valid) {
      return SettingsDto.create(json as SettingsDto);
    }

    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid settings data:\n${errors}`);
  }

  readonly dataDir?: string;

  private constructor(dataDir?: string) {
    this.dataDir = dataDir;
  }

  validate(): Settings {
    return Settings.create(this);
  }
}
