// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class CurrentIntervalQuery {
  static create(_options?: never) {
    return new CurrentIntervalQuery();
  }

  static createTestInstance(options?: never) {
    return CurrentIntervalQuery.create(options);
  }
}

export class CurrentIntervalQueryResult {
  static create({
    timestamp,
    duration,
  }: {
    timestamp?: Temporal.Instant | string;
    duration?: Temporal.DurationLike | string;
  } = {}) {
    return new CurrentIntervalQueryResult(timestamp, duration);
  }

  static createTestInstance({
    timestamp = "2026-03-29T10:38:00Z",
    duration = "PT30M",
  }: {
    timestamp?: Temporal.Instant | string;
    duration?: Temporal.DurationLike | string;
  } = {}) {
    return CurrentIntervalQueryResult.create({ timestamp, duration });
  }

  readonly timestamp?: Temporal.Instant;
  readonly duration?: Temporal.Duration;

  private constructor(
    timestamp?: Temporal.Instant | string,
    duration?: Temporal.DurationLike | string,
  ) {
    this.timestamp =
      timestamp != null ? Temporal.Instant.from(timestamp) : undefined;
    this.duration =
      duration != null ? Temporal.Duration.from(duration) : undefined;
  }
}
