// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimerTickedEvent {
  readonly type: "timer-ticked";
  readonly data: TimerTickedEventData;
}

export type TimerTickedEventData = Readonly<{
  timer: string;
  progressedTime: Temporal.DurationLike;
  duration: Temporal.DurationLike;
}>;

export function createTimerTickedEvent({
  timer = "default",
  progressedTime,
  duration,
}: {
  timer?: string;
  progressedTime: Temporal.DurationLike;
  duration: Temporal.DurationLike;
}): TimerTickedEvent {
  return {
    type: "timer-ticked",
    data: { timer, progressedTime, duration },
  };
}
