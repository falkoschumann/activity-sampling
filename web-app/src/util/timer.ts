// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Clock } from "./clock.ts";
import { OutputTracker } from "./output_tracker.ts";

export type Task = () => void;

export type Cancel = () => void;

export class Timer extends EventTarget {
  static create() {
    return new Timer(Clock.create(), globalThis);
  }

  static createNull(fixedDate?: Date) {
    return new Timer(Clock.createNull(fixedDate), new GlobalStub());
  }

  #global: GlobalStub;
  #clock: Clock;

  private constructor(clock: Clock, global: GlobalStub) {
    super();
    this.#clock = clock;
    this.#global = global;
  }

  #tasks = new Map<unknown, Task>();

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

  #cancel(timeoutId: unknown) {
    this.#global.clearTimeout(timeoutId);
    this.#tasks.delete(timeoutId);
    this.dispatchEvent(
      new CustomEvent("TASK_CANCELLED", { detail: { timeoutId } }),
    );
  }
}

let timeoutIdStub = 0;

class GlobalStub {
  setTimeout(_callback: () => void, _ms?: number): unknown {
    return timeoutIdStub++;
  }

  clearTimeout(_timeoutId: unknown) {}

  setInterval(_callback: () => void, _ms?: number): unknown {
    return timeoutIdStub++;
  }
}
