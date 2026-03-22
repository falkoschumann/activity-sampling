// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  type CurrentIntervalQuery,
  CurrentIntervalQueryResult,
} from "../../shared/domain/current_interval_query";
import { Clock } from "../../shared/domain/temporal";
import type { TimerState } from "../domain/timer_state";

export class CurrentIntervalQueryHandler {
  static create({
    timerState,
    clock = Clock.systemDefaultZone(),
  }: {
    timerState: TimerState;
    clock?: Clock;
  }) {
    return new CurrentIntervalQueryHandler(timerState, clock);
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
    );
  }

  #clock: Clock;

  #timerState: TimerState;

  private constructor(timerState: TimerState, clock: Clock) {
    this.#timerState = timerState;
    this.#clock = clock;
  }

  async handle(
    _query: CurrentIntervalQuery,
  ): Promise<CurrentIntervalQueryResult> {
    return CurrentIntervalQueryResult.create({
      timestamp: this.#clock.instant(),
      duration:
        this.#timerState.currentInterval ?? Temporal.Duration.from("PT30M"),
    });
  }
}
