// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimerElapsedEvent } from "./timer/timer_elapsed.event";
import { TimerStartedEvent } from "./timer/timer_started.event";
import { TimerStoppedEvent } from "./timer/timer_stopped.event";
import { TimerTickedEvent } from "./timer/timer_ticked.event";

export type TimerView = {
  readonly isRunning: boolean;
  readonly elapsedTime: Temporal.Duration;
  readonly progress: number;
};

export function createTimer(): TimerView {
  return {
    isRunning: false,
    elapsedTime: Temporal.Duration.from("PT0S"),
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
        elapsedTime: Temporal.Duration.from("PT0S"),
        progress: 0,
      };
    case "timer-stopped":
      return { ...view, isRunning: false };
    case "timer-ticked":
      return {
        ...view,
        elapsedTime: event.data.progressedTime,
        progress:
          event.data.progressedTime.total("seconds") /
          event.data.duration.total("seconds"),
      };
    case "timer-elapsed":
      return {
        ...view,
        elapsedTime: Temporal.Duration.from("PT0S"),
        progress: 0,
      };
    default:
      return view;
  }
}
