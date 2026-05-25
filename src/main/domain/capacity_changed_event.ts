// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class CapacityChangedEvent {
  static create({ capacity }: { capacity: Temporal.DurationLike | string }) {
    return new CapacityChangedEvent(capacity);
  }

  readonly capacity: Temporal.Duration;

  private constructor(capacity: Temporal.DurationLike | string) {
    this.capacity = Temporal.Duration.from(capacity);
  }
}
