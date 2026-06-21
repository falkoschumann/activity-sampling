// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TickTimerCommand } from "../../../shared/domain/timer/tick_timer.command";
import { TimerTickedEvent } from "./timer_ticked.event";
import { TimerElapsedEvent } from "./timer_elapsed.event";

export function tickTimer(
  command: TickTimerCommand,
): (TimerTickedEvent | TimerElapsedEvent)[] {
  if (command.data.isElapsed) {
    return [TimerElapsedEvent.create(command.data)];
  }

  return [TimerTickedEvent.create(command.data)];
}
