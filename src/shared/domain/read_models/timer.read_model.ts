// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimerElapsedEvent } from "../timer/timer_elapsed.event";
import type { TimerStartedEvent } from "../timer/timer_started.event";
import type { TimerStoppedEvent } from "../timer/timer_stopped.event";
import type { TimerTickedEvent } from "../timer/timer_ticked.event";
import { normalizeDuration } from "../value_objects/activity.value_object";

export type TimerView = {
  readonly isRunning: boolean;
  readonly interval: Temporal.DurationLike;
  readonly remainingTime: Temporal.DurationLike;
  readonly progress: number;
};

export function createTimer(): TimerView {
  return {
    isRunning: false,
    interval: "PT30M",
    remainingTime: "PT30M",
    progress: 0,
  };
}

export function projectTimer(
  view: TimerView,
  event:
    | TimerStartedEvent
    | TimerStoppedEvent
    | TimerTickedEvent
    | TimerElapsedEvent,
): TimerView {
  switch (event.type) {
    case "timer-started":
      return {
        ...view,
        isRunning: true,
        interval: event.data.interval,
        remainingTime: event.data.interval,
        progress: 0,
      };
    case "timer-stopped":
      return { ...view, isRunning: false };
    case "timer-ticked":
      return {
        ...view,
        remainingTime: normalizeDuration(
          Temporal.Duration.from(event.data.duration).subtract(
            event.data.progressedTime,
          ),
        ),
        progress:
          Temporal.Duration.from(event.data.progressedTime).total("seconds") /
          Temporal.Duration.from(event.data.duration).total("seconds"),
      };
    case "timer-elapsed":
      return {
        ...view,
        remainingTime: view.interval,
        progress: 0,
      };
    default:
      return view;
  }
}
