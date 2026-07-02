// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimerStartedEvent } from "./timer_started.event";

export class StartTimerCommand {
  static create({ interval }: { interval: Temporal.DurationLike }) {
    return new StartTimerCommand(interval);
  }

  readonly type = "start-timer";
  readonly data;

  private constructor(interval: Temporal.DurationLike) {
    this.data = {
      interval: Temporal.Duration.from(interval),
    };
  }
}

export function startTimer(command: StartTimerCommand): TimerStartedEvent[] {
  return [TimerStartedEvent.create(command.data)];
}
