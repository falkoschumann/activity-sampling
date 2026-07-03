// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createTimerStartedEvent,
  type TimerStartedEvent,
} from "./timer_started.event";

export interface StartTimerCommand {
  readonly type: "start-timer";
  readonly data: StartTimerCommandData;
}

export type StartTimerCommandData = Readonly<{
  interval: Temporal.DurationLike;
}>;

export function createStartTimerCommand({
  interval,
}: {
  interval: Temporal.DurationLike;
}): StartTimerCommand {
  return {
    type: "start-timer",
    data: { interval },
  };
}

export function startTimer(command: StartTimerCommand): TimerStartedEvent[] {
  return [createTimerStartedEvent(command.data)];
}
