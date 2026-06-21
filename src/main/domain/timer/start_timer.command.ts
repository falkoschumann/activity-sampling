// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { StartTimerCommand } from "../../../shared/domain/timer/start_timer.command";
import { TimerStartedEvent } from "./timer_started.event";

export function startTimer(command: StartTimerCommand): TimerStartedEvent[] {
  return [TimerStartedEvent.create(command.data)];
}
