// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { StopTimerCommand } from "../../../shared/domain/timer/stop_timer.command";
import { TimerStoppedEvent } from "./timer_stopped.event";

export function stopTimer(_command: StopTimerCommand): TimerStoppedEvent[] {
  return [TimerStoppedEvent.create()];
}
