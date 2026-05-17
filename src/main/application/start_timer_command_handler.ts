// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";

import type { StartTimerCommand } from "../../shared/domain/start_timer_command";
import { TimerStartedEvent } from "../../shared/domain/timer_started_event";
import { Clock } from "../../shared/domain/temporal";
import { Timer } from "../infrastructure/timer";
import type { TimerState } from "../domain/timer_state";

export class StartTimerCommandHandler extends EventTarget {
  static create({
    timerState,
    timer,
  }: {
    timerState: TimerState;
    timer: Timer;
  }) {
    return new StartTimerCommandHandler(
      timerState,
      timer,
      Clock.systemDefaultZone(),
    );
  }

  static createNull({
    timerState,
    fixedInstant = "2025-08-28T15:52:00Z",
  }: {
    timerState: TimerState;
    fixedInstant?: string;
  }) {
    return new StartTimerCommandHandler(
      timerState,
      Timer.createNull({ fixedInstant }),
      Clock.fixed(fixedInstant, "Europe/Berlin"),
    );
  }

  #timer: Timer;
  #clock: Clock;

  #timerState: TimerState;

  private constructor(timerState: TimerState, timer: Timer, clock: Clock) {
    super();
    this.#timerState = timerState;
    this.#timer = timer;
    this.#clock = clock;
  }

  async handle(command: StartTimerCommand): Promise<CommandStatus> {
    const start = this.#clock.instant();
    this.#timerState.currentInterval = command.interval;
    this.#timer.start(command.interval.total("milliseconds"));
    this.dispatchEvent(
      TimerStartedEvent.create({
        timestamp: start,
        interval: command.interval,
      }),
    );
    return new Success();
  }
}
