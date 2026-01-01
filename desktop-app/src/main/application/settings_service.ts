// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Settings } from "../../shared/domain/settings";
import { SettingsGateway } from "../infrastructure/settings_gateway";
import { Temporal } from "@js-temporal/polyfill";

export interface SettingsChangedEventInit {
  readonly dataDir: string;
  readonly capacity: Temporal.Duration;
  readonly categories: string[];
}

export class SettingsChangedEvent extends Event {
  static readonly TYPE = "SettingsChangedEvent";

  static create(settings: SettingsChangedEventInit) {
    return new SettingsChangedEvent(SettingsChangedEvent.TYPE, settings);
  }

  readonly dataDir: string;
  readonly capacity: Temporal.Duration;
  readonly categories: string[];

  constructor(type: string, eventInitDict: SettingsChangedEventInit) {
    super(type);
    this.dataDir = eventInitDict.dataDir;
    this.capacity = eventInitDict.capacity;
    this.categories = eventInitDict.categories;
  }
}

export class SettingsService extends EventTarget {
  static create() {
    return new SettingsService(SettingsGateway.create());
  }

  readonly #settingsGateway: SettingsGateway;

  constructor(settingsGateway: SettingsGateway) {
    super();
    this.#settingsGateway = settingsGateway;
  }

  async loadSettings(): Promise<Settings> {
    const settings = await this.#settingsGateway.load();
    return settings ?? Settings.createDefault();
  }

  async storeSettings(settings: Settings): Promise<void> {
    await this.#settingsGateway.store(settings);
    this.dispatchEvent(SettingsChangedEvent.create(settings));
  }
}
