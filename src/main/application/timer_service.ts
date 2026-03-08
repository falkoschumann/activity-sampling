// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Success } from "@muspellheim/shared";

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
    fixedInstant = "2025-08-28T15:52:00Z",
  } = {}): TimerService {
    return new TimerService(
      Clock.fixed(fixedInstant, "Europe/Berlin"),
      timerStub as unknown as typeof globalThis,
    );
  }

  #clock: Clock;
  #timer: typeof globalThis;

  #end?: Temporal.Instant;
  #interval?: Temporal.DurationLike;
  #intervalId?: ReturnType<typeof globalThis.setInterval>;

  #currentInterval?: Temporal.DurationLike;

  constructor(clock: Clock, timer: typeof globalThis) {
    super();
    this.#clock = clock;
    this.#timer = timer;
  }

  async startTimer(command: StartTimerCommand): Promise<CommandStatus> {
    this.#timer.clearInterval(this.#intervalId);

    const start = this.#clock.instant();
    this.#interval = command.interval;
    this.#end = start.add(this.#interval);
    this.#intervalId = this.#timer.setInterval(() => {
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

  async stopTimer(_command: StopTimerCommand): Promise<CommandStatus> {
    this.#timer.clearInterval(this.#intervalId);
    this.dispatchEvent(
      TimerStoppedEvent.create({ timestamp: this.#clock.instant() }),
    );
    return new Success();
  }

  async queryCurrentInterval(
    _query: CurrentIntervalQuery,
  ): Promise<CurrentIntervalQueryResult> {
    return CurrentIntervalQueryResult.create({
      timestamp: this.#clock.instant(),
      duration: this.#currentInterval ?? Temporal.Duration.from("PT30M"),
    });
  }

  async simulateTimePassing(duration: Temporal.DurationLike | string) {
    this.#clock = Clock.offset(this.#clock, duration);
  }

  async simulateIntervalElapsed() {
    if (!this.#end) {
      throw new Error("Timer has not been started");
    }

    this.#clock = Clock.fixed(this.#end, this.#clock.zone);
    this.#handleIntervalElapsed();
  }

  #handleIntervalElapsed() {
    this.#currentInterval = this.#interval!;
    this.dispatchEvent(
      IntervalElapsedEvent.create({
        timestamp: this.#end!,
        interval: this.#currentInterval,
      }),
    );
    this.#end = this.#end!.add(this.#interval!);
  }
}

const timerStub = {
  setInterval: () => 0,
  clearInterval: () => {},
};
