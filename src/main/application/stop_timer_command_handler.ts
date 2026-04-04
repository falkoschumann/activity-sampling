// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import type { StopTimerCommand } from "../../shared/domain/stop_timer_command";
import { Clock } from "../../shared/domain/temporal";
import { TimerStoppedEvent } from "../../shared/domain/timer_stopped_event";
import { Timer } from "../infrastructure/timer";

export class StopTimerCommandHandler extends EventTarget {
  static create() {
    return new StopTimerCommandHandler(
      Clock.systemDefaultZone(),
      Timer.create(),
    );
  }

  static createNull({
    fixedInstant = "2025-08-28T15:52:00Z",
  }: {
    fixedInstant?: string;
  }) {
    return new StopTimerCommandHandler(
      Clock.fixed(fixedInstant, "Europe/Berlin"),
      Timer.createNull({ fixedInstant }),
    );
  }

  #clock: Clock;
  #timer: Timer;

  private constructor(clock: Clock, timer: Timer) {
    super();
    this.#clock = clock;
    this.#timer = timer;
  }

  async handle(_command: StopTimerCommand): Promise<CommandStatus> {
    this.#timer.stop();
    this.dispatchEvent(
      TimerStoppedEvent.create({ timestamp: this.#clock.instant() }),
    );
    return new Success();
  }
}
