// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses, OutputTracker } from "@muspellheim/shared";
import { app } from "electron";

import { Settings } from "../../shared/domain/settings";
import { SettingsDto } from "../../shared/infrastructure/settings";

const STORED_EVENT = "stored";

export interface SettingsConfiguration {
  readonly fileName: string;
}

export class SettingsGateway extends EventTarget {
  static create(
    configuration: SettingsConfiguration = {
      fileName: path.join(app.getPath("userData"), "settings.json"),
    },
  ): SettingsGateway {
    return new SettingsGateway(configuration, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (SettingsDto | null | Error)[];
  } = {}): SettingsGateway {
    return new SettingsGateway(
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

  async load(): Promise<Settings | undefined> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName, "utf-8");
      const json = JSON.parse(fileContent);
      return SettingsDto.fromJson(json).validate();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, no events recorded yet
        return;
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

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<
    SettingsDto | null | Error
  >;

  constructor(readFileResponses: (SettingsDto | null | Error)[]) {
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
