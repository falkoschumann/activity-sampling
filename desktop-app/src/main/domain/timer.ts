// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export interface AskPeriodicallyCommand {
  readonly interval: Temporal.DurationLike;
}

export function createTestAskPeriodicallyCommand({
  interval = Temporal.Duration.from("PT30M"),
}: Partial<AskPeriodicallyCommand> = {}): AskPeriodicallyCommand {
  return { interval };
}

export class TimerStartedEvent extends Event {
  readonly timestamp: Temporal.Instant;
  readonly interval: Temporal.DurationLike;

  constructor(timestamp: Temporal.Instant, interval: Temporal.DurationLike) {
    super("timerStarted");
    this.timestamp = timestamp;
    this.interval = interval;
  }
}
