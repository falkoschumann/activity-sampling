// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createTimerTickedEvent,
  type TimerTickedEvent,
} from "./timer_ticked.event";
import {
  createTimerElapsedEvent,
  type TimerElapsedEvent,
} from "./timer_elapsed.event";

export interface TickTimerCommand {
  readonly type: "tick-timer";
  readonly data: TickTimerCommandData;
}

export type TickTimerCommandData = Readonly<
  | {
      isElapsed: true;
      duration: Temporal.DurationLike;
    }
  | {
      isElapsed: false;
      duration: Temporal.DurationLike;
      progressedTime: Temporal.DurationLike;
    }
>;

export function createTickTimerCommand({
  isElapsed = false,
  duration,
  progressedTime,
}: {
  isElapsed?: boolean;
  duration: Temporal.DurationLike;
  progressedTime?: Temporal.DurationLike;
}): TickTimerCommand {
  if (isElapsed) {
    return {
      type: "tick-timer",
      data: { isElapsed, duration },
    };
  } else {
    if (progressedTime == null) {
      throw new TypeError(
        "Progressed time is required when timer is not elapsed",
      );
    }

    return {
      type: "tick-timer",
      data: { isElapsed, duration, progressedTime },
    };
  }
}

export function tickTimer(
  command: TickTimerCommand,
): (TimerTickedEvent | TimerElapsedEvent)[] {
  if (command.data.isElapsed) {
    return [createTimerElapsedEvent(command.data)];
  }

  return [createTimerTickedEvent(command.data)];
}
