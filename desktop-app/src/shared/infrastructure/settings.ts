// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";
import addFormats from "ajv-formats";

import { Settings } from "../domain/settings";

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
  }: {
    dataDir: string;
    capacity: string;
  }): SettingsDto {
    return new SettingsDto(dataDir, capacity);
  }

  static fromModel(model: Settings): SettingsDto {
    return SettingsDto.create({
      dataDir: model.dataDir,
      capacity: model.capacity.toString(),
    });
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

  readonly dataDir: string;
  readonly capacity: string;

  private constructor(dataDir: string, capacity: string) {
    this.dataDir = dataDir;
    this.capacity = capacity;
  }

  validate(): Settings {
    return Settings.create(this);
  }
}
