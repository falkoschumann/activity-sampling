// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { CommandStatus } from "../../shared/common/messages";
import { Clock } from "../../shared/common/temporal";
import {
  type CurrentIntervalQuery,
  CurrentIntervalQueryResult,
  IntervalElapsedEvent,
  type StartTimerCommand,
  type StopTimerCommand,
  TimerStartedEvent,
  TimerStoppedEvent,
} from "../../shared/domain/timer";

export class TimerService extends EventTarget {
  static create({ clock = Clock.systemDefaultZone() } = {}): TimerService {
    return new TimerService(clock, globalThis);
  }

  static createNull({
    clock = Clock.fixed("2025-08-28T15:52:00Z", "Europe/Berlin"),
  } = {}): TimerService {
    return new TimerService(clock, timerStub as unknown as typeof globalThis);
  }

  clock: Clock;
  #timer: typeof globalThis;

  #start?: Temporal.Instant;
  #interval?: Temporal.DurationLike;
  #timeout?: ReturnType<typeof globalThis.setTimeout>;

  #currentInterval?: Temporal.DurationLike;

  constructor(clock: Clock, timer: typeof globalThis) {
    super();
    this.clock = clock;
    this.#timer = timer;
  }

  startTimer(command: StartTimerCommand): CommandStatus {
    this.#timer.clearTimeout(this.#timeout);

    this.#start = this.clock.instant();
    this.#interval = Temporal.Duration.from(command.interval);
    this.#timeout = this.#timer.setTimeout(
      () => this.#handleIntervalElapsed(),
      Temporal.Duration.from(command.interval).total("milliseconds"),
    );
    this.dispatchEvent(
      new TimerStartedEvent(this.clock.instant(), command.interval),
    );
    return CommandStatus.success();
  }

  stopTimer(_command: StopTimerCommand): CommandStatus {
    this.#timer.clearTimeout(this.#timeout);
    this.dispatchEvent(new TimerStoppedEvent(this.clock.instant()));
    return CommandStatus.success();
  }

  queryCurrentInterval(
    _query: CurrentIntervalQuery,
  ): CurrentIntervalQueryResult {
    return new CurrentIntervalQueryResult(
      this.clock.instant(),
      this.#currentInterval ?? Temporal.Duration.from("PT30M"),
    );
  }

  simulateTimePassing(duration: Temporal.DurationLike | string) {
    this.clock = Clock.offset(this.clock, duration);
  }

  simulateIntervalElapsed() {
    if (!this.#start || !this.#interval) {
      throw new Error("Timer has not been started");
    }

    const end = this.#start.add(this.#interval);
    this.clock = Clock.fixed(end, this.clock.zone);
    this.#handleIntervalElapsed();
  }

  #handleIntervalElapsed() {
    this.#currentInterval = this.#interval!;
    this.dispatchEvent(
      new IntervalElapsedEvent(this.clock.instant(), this.#currentInterval),
    );
  }
}

const timerStub = {
  setTimeout: () => 0,
  clearTimeout: () => {},
};
