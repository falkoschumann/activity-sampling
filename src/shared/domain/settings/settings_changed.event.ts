// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class SettingsChangedEvent {
  static create({
    capacity = "PT40H",
    categories = ["", "Feature", "Rework"],
    firstName,
    lastName,
  }: {
    capacity?: Temporal.DurationLike;
    categories?: string[];
    firstName?: string;
    lastName?: string;
  } = {}): SettingsChangedEvent {
    return new SettingsChangedEvent(capacity, categories, firstName, lastName);
  }

  static createTestInstance({
    capacity = "PT32H",
    categories = ["", "Feature", "Rework", "Training"],
    firstName = "John",
    lastName = "Doe",
  }: {
    capacity?: Temporal.DurationLike;
    categories?: string[];
    firstName?: string;
    lastName?: string;
  } = {}) {
    return SettingsChangedEvent.create({
      capacity,
      categories,
      firstName,
      lastName,
    });
  }

  readonly type = "change-settings";
  readonly data;

  private constructor(
    capacity: Temporal.DurationLike,
    categories: string[],
    firstName?: string,
    lastName?: string,
  ) {
    this.data = {
      capacity: Temporal.Duration.from(capacity),
      categories,
      firstName,
      lastName,
    };
  }
}
