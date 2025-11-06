// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Settings {
  static create({
    dataDir,
    capacity = "PT40H",
  }: {
    dataDir: string;
    capacity?: Temporal.DurationLike | string;
  }): Settings {
    return new Settings(dataDir, capacity);
  }

  static createDefault(): Settings {
    return Settings.create({ dataDir: "data" });
  }

  readonly dataDir: string;
  readonly capacity: Temporal.Duration;

  private constructor(
    dataDir: string,
    capacity: Temporal.DurationLike | string,
  ) {
    this.dataDir = dataDir;
    this.capacity = Temporal.Duration.from(capacity);
  }
}
