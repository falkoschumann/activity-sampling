// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class SettingsQuery {
  static create(_options?: never) {
    return new SettingsQuery();
  }

  static createTestInstance(options?: never) {
    return SettingsQuery.create(options);
  }

  private constructor() {}
}

export class SettingsQueryResult {
  static create({
    dataDir = "data",
    capacity = "PT40H",
    categories = ["", "Feature", "Rework"],
  }: {
    dataDir?: string;
    capacity?: Temporal.DurationLike | string;
    categories?: string[];
  } = {}) {
    return new SettingsQueryResult(dataDir, capacity, categories);
  }

  static createTestInstance({
    dataDir = "test-data",
    capacity = "PT32H",
    categories = ["", "Feature", "Rework", "Training"],
  }: {
    dataDir?: string;
    capacity?: Temporal.DurationLike | string;
    categories?: string[];
  } = {}) {
    return SettingsQueryResult.create({ dataDir, capacity, categories });
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
