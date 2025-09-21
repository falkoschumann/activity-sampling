// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { TimerService } from "../../src/main/application/timer_service";
import { Clock } from "../../src/shared/common/temporal";
import {
  CurrentIntervalQuery,
  StartTimerCommand,
  StopTimerCommand,
} from "../../src/shared/domain/timer";

describe("Timer service", () => {
  describe("Start timer", () => {
    it("should start the timer with a given interval", () => {
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
      "should start the timer with the default interval when the application starts",
    );
  });

  describe("Stop timer", () => {
    it("should stop the timer", () => {
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

  describe("Query current interval", () => {
    it("should notify the user when an interval is elapsed", async () => {
      const service = TimerService.createNull({
        clock: Clock.fixed("2025-08-28T19:41:00Z", "Europe/Berlin"),
      });
      const events: Event[] = [];
      service.addEventListener("intervalElapsed", (event) =>
        events.push(event),
      );
      await service.startTimer(new StartTimerCommand("PT30M"));

      await service.simulateIntervalElapsed();
      const result = await service.queryCurrentInterval(
        new CurrentIntervalQuery(),
      );

      expect(events).toEqual([
        expect.objectContaining({
          type: "intervalElapsed",
          timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
          interval: Temporal.Duration.from("PT30M"),
        }),
      ]);
      expect(result).toEqual({
        timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
        duration: Temporal.Duration.from("PT30M"),
      });
    });

    describe("Simulate interval elapsed", () => {
      it("should throw an error when simulating interval elapsed without starting timer", () => {
        const service = TimerService.createNull();

        const result = service.simulateIntervalElapsed();

        expect(result).rejects.toThrowError("Timer has not been started");
      });
    });
  });
});
