// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import type { StopTimerCommand } from "../../shared/domain/stop_timer_command";
import { TimerStoppedEvent } from "../../shared/domain/timer_stopped_event";
import { Timer } from "../infrastructure/timer";

export class StopTimerCommandHandler extends EventTarget {
  static create() {
    return new StopTimerCommandHandler(Timer.create());
  }

  static createNull({
    fixedInstant = "2025-08-28T15:52:00Z",
  }: {
    fixedInstant?: string;
  }) {
    return new StopTimerCommandHandler(Timer.createNull({ fixedInstant }));
  }

  #timer: Timer;

  private constructor(timer: Timer) {
    super();
    this.#timer = timer;
  }

  async handle(_command: StopTimerCommand): Promise<CommandStatus> {
    this.#timer.stop();
    this.dispatchEvent(TimerStoppedEvent.create());
    return new Success();
  }
}
