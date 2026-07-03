// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createTimerStoppedEvent,
  type TimerStoppedEvent,
} from "./timer_stopped.event";

export type StopTimerCommand = Readonly<{
  type: "stop-timer";
  data: StopTimerCommandData;
}>;

export type StopTimerCommandData = null;

export function createStopTimerCommand(data = null): StopTimerCommand {
  return { type: "stop-timer", data };
}

export function stopTimer(_command: StopTimerCommand): TimerStoppedEvent[] {
  return [createTimerStoppedEvent()];
}
