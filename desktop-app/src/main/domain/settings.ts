// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Settings {
  static create({
    dataDir,
    capacity,
  }: {
    dataDir: string;
    capacity: Temporal.DurationLike | string;
  }): Settings {
    return new Settings(dataDir, capacity);
  }

  static createDefault(): Settings {
    return new Settings("data", "PT40H");
  }

  dataDir: string;
  capacity: Temporal.Duration;

  private constructor(
    dataDir: string,
    capacity: Temporal.DurationLike | string = "PT40H",
  ) {
    this.dataDir = dataDir;
    this.capacity = Temporal.Duration.from(capacity);
  }
}
