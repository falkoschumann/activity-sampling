// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Clock } from "./clock";
import { OutputTracker } from "./output_tracker";

export type Task = () => void;

export type Cancel = () => void;

type TimeoutId = NodeJS.Timeout | number;

export class Timer extends EventTarget {
  static create() {
    return new Timer(Clock.create(), globalThis);
  }

  static createNull(fixedDate?: Date) {
    return new Timer(
      Clock.createNull(fixedDate),
      new GlobalStub() as unknown as typeof globalThis,
    );
  }

  readonly #global: typeof globalThis;
  readonly #clock: Clock;

  private constructor(clock: Clock, global: typeof globalThis) {
    super();
    this.#clock = clock;
    this.#global = global;
  }

  #tasks = new Map<TimeoutId, Task>();

  schedule(task: Task, delay: number, period?: number): Cancel;
  schedule(task: Task, firstTime: Date, period?: number): Cancel;
  schedule(
    task: Task,
    delayOrFirstTime: number | Date,
    period?: number,
  ): Cancel {
    const delay =
      delayOrFirstTime instanceof Date
        ? delayOrFirstTime.getTime() - this.#clock.now().getTime()
        : delayOrFirstTime;
    if (delay < 0) {
      throw new Error("Delay must be non-negative.");
    }
    if (period != null && period <= 0) {
      throw new Error("Period must be positive.");
    }

    let timeoutId = this.#global.setTimeout(() => {
      this.#tasks.delete(timeoutId);
      task();

      if (period != null) {
        timeoutId = this.#global.setInterval(task, period);
        this.#tasks.set(timeoutId, task);
      }
    }, delay);
    this.#tasks.set(timeoutId, task);
    this.dispatchEvent(
      new CustomEvent("TASK_SCHEDULED", {
        detail: {
          timeoutId,
          delayOrFirstTime,
          period,
        },
      }),
    );
    return () => this.#cancel(timeoutId);
  }

  trackScheduledTasks() {
    return OutputTracker.create<{
      timeoutId: number;
      delayOrFirstTime: number | Date;
      period?: number;
    }>(this, "TASK_SCHEDULED");
  }

  trackCancelledTasks() {
    return OutputTracker.create<{ timeoutId: number }>(this, "TASK_CANCELLED");
  }

  cancel() {
    for (const timeoutId of this.#tasks.keys()) {
      this.#cancel(timeoutId);
    }
  }

  simulateTaskRun(count = 1) {
    while (count-- > 0) {
      for (const task of this.#tasks.values()) {
        task();
      }
    }
  }

  #cancel(timeoutId: TimeoutId) {
    this.#global.clearTimeout(timeoutId);
    this.#tasks.delete(timeoutId);
    this.dispatchEvent(
      new CustomEvent("TASK_CANCELLED", { detail: { timeoutId } }),
    );
  }
}

class GlobalStub {
  static timeoutIdStub = 0;

  setTimeout(_callback: () => void, _ms?: number): TimeoutId {
    return GlobalStub.timeoutIdStub++;
  }

  clearTimeout(_timeoutId?: TimeoutId) {}

  setInterval(_callback: () => void, _ms?: number): TimeoutId {
    return GlobalStub.timeoutIdStub++;
  }
}
