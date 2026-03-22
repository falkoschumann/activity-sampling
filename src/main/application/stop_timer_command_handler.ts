// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import type { StopTimerCommand } from "../../shared/domain/stop_timer_command";
import { TimerStoppedEvent } from "../../shared/domain/timer_stopped_event";
import { Clock } from "../../shared/domain/temporal";
import type { TimerState } from "../domain/timer_state";
import { timerStub } from "../infrastructure/timer_stub";

export class StopTimerCommandHandler extends EventTarget {
  static create({
    timerState,
    clock = Clock.systemDefaultZone(),
  }: {
    timerState: TimerState;
    clock?: Clock;
  }) {
    return new StopTimerCommandHandler(timerState, clock, globalThis);
  }

  static createNull({
    timerState,
    fixedInstant = "2025-08-28T15:52:00Z",
  }: {
    timerState: TimerState;
    fixedInstant?: string;
  }) {
    return new StopTimerCommandHandler(
      timerState,
      Clock.fixed(fixedInstant, "Europe/Berlin"),
      timerStub as unknown as typeof globalThis,
    );
  }

  #clock: Clock;
  #timer: typeof globalThis;

  #timerState: TimerState;

  private constructor(
    timerState: TimerState,
    clock: Clock,
    timer: typeof globalThis,
  ) {
    super();
    this.#timerState = timerState;
    this.#clock = clock;
    this.#timer = timer;
  }

  async handle(_command: StopTimerCommand): Promise<CommandStatus> {
    this.#timer.clearInterval(this.#timerState.intervalId);
    this.dispatchEvent(
      TimerStoppedEvent.create({ timestamp: this.#clock.instant() }),
    );
    return new Success();
  }
}
