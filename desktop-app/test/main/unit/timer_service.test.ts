// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { TimerService } from "../../../src/main/application/timer_service";
import {
  CurrentIntervalQuery,
  CurrentIntervalQueryResult,
  IntervalElapsedEvent,
  StartTimerCommand,
  StopTimerCommand,
  TimerStartedEvent,
  TimerStoppedEvent,
} from "../../../src/shared/domain/timer";
import { EventTracker } from "@muspellheim/shared";

describe("Timer service", () => {
  describe("Start timer", () => {
    it("should start the timer with a given interval", () => {
      const service = TimerService.createNull({
        fixedInstant: "2025-08-28T19:41:00Z",
      });
      const trackedEvents = EventTracker.create(
        service,
        TimerStartedEvent.TYPE,
      );

      service.startTimer(StartTimerCommand.create({ interval: "PT30M" }));

      expect(trackedEvents.events).toEqual<TimerStartedEvent[]>([
        expect.objectContaining({
          type: "timerStarted",
          timestamp: Temporal.Instant.from("2025-08-28T19:41:00Z"),
          interval: Temporal.Duration.from("PT30M"),
        }),
      ]);
    });
  });

  describe("Stop timer", () => {
    it("should stop the timer", () => {
      const service = TimerService.createNull({
        fixedInstant: "2025-08-28T19:41:00Z",
      });
      const trackedEvents = EventTracker.create(
        service,
        TimerStoppedEvent.TYPE,
      );

      service.startTimer(StartTimerCommand.create({ interval: "PT30M" }));

      service.simulateTimePassing("PT2M");
      service.stopTimer(StopTimerCommand.create());

      expect(trackedEvents.events).toEqual<TimerStoppedEvent[]>([
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
        fixedInstant: "2025-08-28T19:41:00Z",
      });
      const trackedEvents = EventTracker.create(
        service,
        IntervalElapsedEvent.TYPE,
      );

      await service.startTimer(StartTimerCommand.create({ interval: "PT30M" }));

      await service.simulateIntervalElapsed();
      const result = await service.queryCurrentInterval(
        CurrentIntervalQuery.create(),
      );

      expect(trackedEvents.events).toEqual<IntervalElapsedEvent[]>([
        expect.objectContaining({
          type: "intervalElapsed",
          timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
          interval: Temporal.Duration.from("PT30M"),
        }),
      ]);
      expect(result).toEqual<CurrentIntervalQueryResult>({
        timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
        duration: Temporal.Duration.from("PT30M"),
      });
    });
  });

  describe("Simulate interval elapsed", () => {
    it("should simulate interval elapsed", async () => {
      const service = TimerService.createNull({
        fixedInstant: "2025-08-28T19:41:00Z",
      });
      const trackedEvents = EventTracker.create(
        service,
        IntervalElapsedEvent.TYPE,
      );
      await service.startTimer(StartTimerCommand.create({ interval: "PT20M" }));

      await service.simulateIntervalElapsed();

      const result = await service.queryCurrentInterval({});
      expect(result).toEqual<CurrentIntervalQueryResult>({
        timestamp: Temporal.Instant.from("2025-08-28T20:01:00Z"),
        duration: Temporal.Duration.from("PT20M"),
      });
      expect(trackedEvents.events).toEqual<IntervalElapsedEvent[]>([
        expect.objectContaining({
          type: "intervalElapsed",
          timestamp: Temporal.Instant.from("2025-08-28T20:01:00Z"),
          interval: Temporal.Duration.from("PT20M"),
        }),
      ]);
    });

    it("should throw an error when simulating interval elapsed without starting timer", async () => {
      const service = TimerService.createNull();

      const result = service.simulateIntervalElapsed();

      await expect(result).rejects.toThrowError("Timer has not been started");
    });
  });
});
