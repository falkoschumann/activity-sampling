// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimerStartedEvent {
  readonly type: "timer-started";
  readonly data: TimerStartedEventData;
}

export type TimerStartedEventData = Readonly<{
  timer: string;
  interval: Temporal.DurationLike;
}>;

export function createTimerStartedEvent({
  timer = "default",
  interval,
}: {
  timer?: string;
  interval: Temporal.DurationLike;
}): TimerStartedEvent {
  return {
    type: "timer-started",
    data: { timer, interval },
  };
}
