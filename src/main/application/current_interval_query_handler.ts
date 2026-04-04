// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type CurrentIntervalQuery,
  CurrentIntervalQueryResult,
} from "../../shared/domain/current_interval_query";
import { IntervalElapsedEvent } from "../../shared/domain/interval_elapsed_event";
import { Clock } from "../../shared/domain/temporal";
import type { TimerState } from "../domain/timer_state";
import { intervalElapsedEventType, Timer } from "../infrastructure/timer";

export class CurrentIntervalQueryHandler extends EventTarget {
  static create({ timerState }: { timerState: TimerState }) {
    return new CurrentIntervalQueryHandler(
      timerState,
      Clock.systemDefaultZone(),
      Timer.create(),
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
      Clock.fixed(fixedInstant, "Europe/Berlin"),
      Timer.createNull({ fixedInstant }),
    );
  }

  #clock: Clock;
  #timer: Timer;

  #timerState: TimerState;

  private constructor(timerState: TimerState, clock: Clock, timer: Timer) {
    super();
    this.#timerState = timerState;
    this.#clock = clock;
    this.#timer = timer;

    timer.addEventListener(intervalElapsedEventType, () =>
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
