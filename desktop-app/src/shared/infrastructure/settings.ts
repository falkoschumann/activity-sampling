// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";
import addFormats from "ajv-formats";

import { Settings } from "../domain/settings";

const ajv = new Ajv();
addFormats(ajv);

const schema = {
  type: "object",
  properties: {
    dataDir: { type: "string" },
    capacity: { type: "string", format: "duration" },
  },
};

export class SettingsDto {
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
