// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Clock } from "../../shared/domain/temporal";
import { Temporal } from "@js-temporal/polyfill";

export const intervalElapsedEventType = "intervalElapsed";

export class Timer extends EventTarget {
  static create() {
    return new Timer(Clock.systemDefaultZone(), globalThis);
  }

  static createNull({
    fixedInstant = "2026-04-04T14:09:00Z",
  }: { fixedInstant?: string } = {}) {
    return new Timer(
      Clock.fixed(Temporal.Instant.from(fixedInstant), "Europe/Berlin"),
      timerStub as unknown as typeof globalThis,
    );
  }

  #clock: Clock;
  #timer: typeof globalThis;

  #isRunning: boolean;
  #intervalMillis!: number;
  #nextTime!: number;
  #timeout?: ReturnType<typeof globalThis.setTimeout>;

  private constructor(clock: Clock, timer: typeof globalThis) {
    super();
    this.#clock = clock;
    this.#timer = timer;
    this.#isRunning = false;
  }

  start(intervalMillis: number) {
    this.stop();

    this.#intervalMillis = intervalMillis;
    this.#isRunning = true;
    const now = this.#clock.millis();
    this.#nextTime = now + this.#intervalMillis;
    this.#schedule();
  }

  stop() {
    this.#isRunning = false;
    this.#timer.clearTimeout(this.#timeout);
  }

  simulateIntervalElapsed() {
    this.#handleIntervalElapsed();
  }

  #schedule() {
    const now = this.#clock.millis();
    const delay = Math.max(0, this.#nextTime - now);
    this.#timeout = this.#timer.setTimeout(
      () => this.#handleIntervalElapsed(),
      delay,
    );
  }

  #handleIntervalElapsed() {
    this.dispatchEvent(new Event(intervalElapsedEventType));

    this.#nextTime += this.#intervalMillis;
    if (this.#isRunning) {
      this.#schedule();
    }
  }
}

export const timerStub = {
  setTimeout: () => 0,
  clearTimeout: () => {},
};
