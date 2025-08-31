// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { TimerService } from "../../src/main/application/timer_service";
import { Clock } from "../../src/main/common/temporal";
import {
  CurrentIntervalQuery,
  StartTimerCommand,
  StopTimerCommand,
} from "../../src/main/domain/timer";

describe("Timer service", () => {
  describe("Start timer", () => {
    it("Starts the timer with a given interval", () => {
      const service = TimerService.createNull({
        clock: Clock.fixed("2025-08-28T19:41:00Z", "Europe/Berlin"),
      });
      const events: Event[] = [];
      service.addEventListener("timerStarted", (event) => events.push(event));

      service.startTimer(new StartTimerCommand("PT30M"));

      expect(events).toEqual([
        expect.objectContaining({
          type: "timerStarted",
          timestamp: Temporal.Instant.from("2025-08-28T19:41:00Z"),
          interval: Temporal.Duration.from("PT30M"),
        }),
      ]);
    });

    it.todo(
      "Starts the timer with the default interval when the application starts",
    );
  });

  describe("Stop timer", () => {
    it("Stops the timer", () => {
      const service = TimerService.createNull({
        clock: Clock.fixed("2025-08-28T19:41:00Z", "Europe/Berlin"),
      });
      const events: Event[] = [];
      service.addEventListener("timerStopped", (event) => events.push(event));
      service.startTimer(new StartTimerCommand("PT30M"));

      service.simulateTimePassing("PT2M");
      service.stopTimer(new StopTimerCommand());

      expect(events).toEqual([
        expect.objectContaining({
          type: "timerStopped",
          timestamp: Temporal.Instant.from("2025-08-28T19:43:00Z"),
        }),
      ]);
    });
  });

  describe("Current interval", () => {
    it("Queries current interval", () => {
      const service = TimerService.createNull({
        clock: Clock.fixed("2025-08-28T19:41:00Z", "Europe/Berlin"),
      });
      const events: Event[] = [];
      service.addEventListener("intervalElapsed", (event) =>
        events.push(event),
      );
      service.startTimer(new StartTimerCommand("PT30M"));

      service.simulateIntervalElapsed();
      const result = service.queryCurrentInterval(new CurrentIntervalQuery());

      expect(result).toEqual({
        timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
        duration: Temporal.Duration.from("PT30M"),
      });
      expect(events).toEqual([
        expect.objectContaining({
          type: "intervalElapsed",
          timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
          interval: Temporal.Duration.from("PT30M"),
        }),
      ]);
    });
  });

  it("Throws error when simulating interval elapsed without starting timer", () => {
    const service = TimerService.createNull();

    expect(() => service.simulateIntervalElapsed()).toThrowError(
      "Timer has not been started",
    );
  });
});
