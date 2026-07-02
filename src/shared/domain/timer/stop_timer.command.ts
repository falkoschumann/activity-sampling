// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimerStoppedEvent } from "./timer_stopped.event";

export class StopTimerCommand {
  static create(_data = null) {
    return new StopTimerCommand();
  }

  readonly type = "stop-timer";
  readonly data = null;

  private constructor() {}
}

export function stopTimer(_command: StopTimerCommand): TimerStoppedEvent[] {
  return [TimerStoppedEvent.create()];
}
