// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Configuration {
  static create(configuration: Configuration) {
    return new Configuration(
      configuration.activities,
      configuration.eventStore,
      configuration.holidays,
    );
  }

  static createDefault(): Configuration {
    return new Configuration(
      ActivitiesConfiguration.createDefault(),
      EventStoreConfiguration.createDefault(),
      HolidayConfiguration.createDefault(),
    );
  }

  readonly activities: ActivitiesConfiguration;
  readonly eventStore: EventStoreConfiguration;
  readonly holidays: HolidayConfiguration;

  constructor(
    activities: ActivitiesConfiguration,
    eventStore: EventStoreConfiguration,
    holidays: HolidayConfiguration,
  ) {
    this.activities = activities;
    this.eventStore = eventStore;
    this.holidays = holidays;
  }
}

export class ActivitiesConfiguration {
  static create(
    configuration: ActivitiesConfiguration,
  ): ActivitiesConfiguration {
    return new ActivitiesConfiguration(configuration.capacity);
  }

  static createDefault(): ActivitiesConfiguration {
    return new ActivitiesConfiguration("PT40H");
  }

  readonly capacity: Temporal.Duration;

  constructor(capacity: Temporal.DurationLike | string) {
    this.capacity = Temporal.Duration.from(capacity);
  }
}

export class EventStoreConfiguration {
  static create(
    configuration: EventStoreConfiguration,
  ): EventStoreConfiguration {
    return new EventStoreConfiguration(configuration.fileName);
  }

  static createDefault(): EventStoreConfiguration {
    return new EventStoreConfiguration("data/events.csv");
  }

  fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }
}

export class HolidayConfiguration {
  static create(configuration: HolidayConfiguration): HolidayConfiguration {
    return new HolidayConfiguration(configuration.fileName);
  }

  static createDefault(): HolidayConfiguration {
    return new HolidayConfiguration("data/holidays.csv");
  }

  fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }
}
