// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export interface TimerStoppedEventInit {
  readonly timestamp: Temporal.Instant | string;
}

export class TimerStoppedEvent extends Event {
  static create(eventInitDict: TimerStoppedEventInit): TimerStoppedEvent {
    return new TimerStoppedEvent(TimerStoppedEvent.TYPE, eventInitDict);
  }

  static readonly TYPE = "timerStopped";

  readonly timestamp: Temporal.Instant;

  private constructor(type: string, eventInitDict: TimerStoppedEventInit) {
    super(type);
    this.timestamp = Temporal.Instant.from(eventInitDict.timestamp);
  }
}
