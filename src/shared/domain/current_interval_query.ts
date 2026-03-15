// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class CurrentIntervalQuery {
  static create(): CurrentIntervalQuery {
    return new CurrentIntervalQuery();
  }
}

export class CurrentIntervalQueryResult {
  static create({
    timestamp,
    duration,
  }: {
    timestamp: Temporal.Instant | string;
    duration: Temporal.DurationLike | string;
  }): CurrentIntervalQueryResult {
    return new CurrentIntervalQueryResult(timestamp, duration);
  }

  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;

  private constructor(
    timestamp: Temporal.Instant | string,
    duration: Temporal.DurationLike | string,
  ) {
    this.timestamp = Temporal.Instant.from(timestamp);
    this.duration = Temporal.Duration.from(duration);
  }
}
