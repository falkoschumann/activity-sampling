// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimerStoppedEvent {
  readonly type: "timer-stopped";
  readonly data: TimerStoppedEventData;
}

export type TimerStoppedEventData = Readonly<{
  timer: string;
}>;

export function createTimerStoppedEvent({
  timer = "default",
}: { timer?: string } = {}): TimerStoppedEvent {
  return {
    type: "timer-stopped",
    data: { timer },
  };
}
