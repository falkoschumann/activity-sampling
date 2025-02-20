// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Timer } from "../../src/infrastructure/timer";

describe("Timer", () => {
  it("Schedules task once", async () => {
    const timer = Timer.create();
    let counter = 0;

    await new Promise<void>((resolve) => {
      timer.schedule(() => {
        counter++;
        resolve();
      }, 0);
    });

    expect(counter).toBe(1);
  });

  it("Schedules repetitive task", async () => {
    const timer = Timer.create();
    let counter = 0;
    let cancel: () => void;

    await new Promise<void>((resolve) => {
      cancel = timer.schedule(
        () => {
          counter++;
          if (counter > 3) {
            resolve();
          }
        },
        1,
        1,
      );
    });
    cancel();

    expect(counter).toBe(4);
  });

  it("Schedules task at timestamp", async () => {
    const timer = Timer.create();
    let counter = 0;

    await new Promise<void>((resolve) => {
      const start = new Date();
      start.setMilliseconds(start.getMilliseconds() + 3);
      timer.schedule(() => {
        counter++;
        resolve();
      }, start);
    });

    expect(counter).toBe(1);
  });

  it("Fails when delay is negative", () => {
    const timer = Timer.create();

    expect(() => timer.schedule(testingTask, -1)).toThrowError(
      "Delay must be non-negative.",
    );
  });

  it("Fails when period is not positive", () => {
    const timer = Timer.create();

    expect(() => timer.schedule(testingTask, 0, 0)).toThrowError(
      "Period must be positive.",
    );
  });
});

function testingTask() {
  // do nothing
}
