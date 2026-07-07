// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimerElapsedEvent {
  readonly type: "timer-elapsed";
  readonly data: TimerElapsedEventData;
}

export type TimerElapsedEventData = Readonly<{
  timer: string;
  notification: string;
  duration: Temporal.DurationLike;
}>;

export function createTimerElapsedEvent({
  timer = "default",
  notification = "notifier",
  duration,
}: {
  timer?: string;
  notification?: string;
  duration: Temporal.DurationLike;
}): TimerElapsedEvent {
  return {
    type: "timer-elapsed",
    data: { timer, notification, duration },
  };
}
