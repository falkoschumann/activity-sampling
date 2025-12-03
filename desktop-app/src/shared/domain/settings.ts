// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Settings {
  static create({
    dataDir,
    capacity = "PT40H",
    categories = ["", "Feature", "Rework"],
  }: {
    dataDir: string;
    capacity?: Temporal.DurationLike | string;
    categories?: string[];
  }): Settings {
    return new Settings(dataDir, capacity, categories);
  }

  static createDefault(): Settings {
    return Settings.create({ dataDir: "data" });
  }

  readonly dataDir: string;
  readonly capacity: Temporal.Duration;
  readonly categories: string[];

  private constructor(
    dataDir: string,
    capacity: Temporal.DurationLike | string,
    categories: string[],
  ) {
    this.dataDir = dataDir;
    this.capacity = Temporal.Duration.from(capacity);
    this.categories = categories;
  }
}
