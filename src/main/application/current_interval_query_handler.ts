// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type CurrentIntervalQuery,
  CurrentIntervalQueryResult,
} from "../../shared/domain/current_interval_query";
import { IntervalElapsedEvent } from "../../shared/domain/interval_elapsed_event";
import { Clock } from "../../shared/domain/temporal";
import type { TimerState } from "../domain/timer_state";
import { INTERVAL_ELAPSED_EVENT, Timer } from "../infrastructure/timer";

export class CurrentIntervalQueryHandler extends EventTarget {
  static create({
    timerState,
    timer,
  }: {
    timerState: TimerState;
    timer: Timer;
  }) {
    return new CurrentIntervalQueryHandler(
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
    return new CurrentIntervalQueryHandler(
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

    timer.addEventListener(INTERVAL_ELAPSED_EVENT, () =>
      this.dispatchEvent(
        IntervalElapsedEvent.create({
          timestamp: this.#clock.instant(),
          interval: this.#timerState.currentInterval!,
        }),
      ),
    );
  }

  async handle(
    _query: CurrentIntervalQuery,
  ): Promise<CurrentIntervalQueryResult> {
    return CurrentIntervalQueryResult.create({
      timestamp: this.#clock.instant(),
      duration: this.#timerState.currentInterval,
    });
  }

  simulateIntervalElapsed() {
    this.#timer.simulateIntervalElapsed();
  }
}
