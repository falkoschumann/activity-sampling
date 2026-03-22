// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Success } from "@muspellheim/shared";

import type { StartTimerCommand } from "../../shared/domain/start_timer_command";
import { TimerStartedEvent } from "../../shared/domain/timer_started_event";
import { Clock } from "../../shared/domain/temporal";
import { IntervalElapsedEvent } from "../../shared/domain/interval_elapsed_event";
import type { TimerState } from "../domain/timer_state";
import { timerStub } from "../infrastructure/timer_stub";

export class StartTimerCommandHandler extends EventTarget {
  static create({
    timerState,
    clock = Clock.systemDefaultZone(),
  }: {
    timerState: TimerState;
    clock?: Clock;
  }) {
    return new StartTimerCommandHandler(timerState, clock, globalThis);
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
      Clock.fixed(fixedInstant, "Europe/Berlin"),
      timerStub as unknown as typeof globalThis,
    );
  }

  #clock: Clock;
  #timer: typeof globalThis;

  #timerState: TimerState;
  #end?: Temporal.Instant;
  #interval?: Temporal.DurationLike;

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

  async handle(command: StartTimerCommand): Promise<CommandStatus> {
    this.#timer.clearInterval(this.#timerState.intervalId);

    const start = this.#clock.instant();
    this.#interval = command.interval;
    // TODO init current intervall when undefined
    this.#end = start.add(this.#interval);
    this.#timerState.intervalId = this.#timer.setInterval(() => {
      const now = this.#clock.instant();
      if (Temporal.Instant.compare(now, this.#end!) >= 0) {
        this.#handleIntervalElapsed();
      }
    }, 3000);
    this.dispatchEvent(
      TimerStartedEvent.create({
        timestamp: start,
        interval: command.interval,
      }),
    );
    return new Success();
  }

  async simulateIntervalElapsed() {
    this.#clock = Clock.fixed(this.#end!, this.#clock.zone);
    this.#handleIntervalElapsed();
  }

  #handleIntervalElapsed() {
    this.#timerState.currentInterval = this.#interval!;
    this.dispatchEvent(
      IntervalElapsedEvent.create({
        timestamp: this.#end!,
        interval: this.#timerState.currentInterval,
      }),
    );
    this.#end = this.#end!.add(this.#interval!);
  }
}
