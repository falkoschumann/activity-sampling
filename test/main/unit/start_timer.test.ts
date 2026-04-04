// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventTracker } from "@muspellheim/shared";
import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { StartTimerCommandHandler } from "../../../src/main/application/start_timer_command_handler";
import { StartTimerCommand } from "../../../src/shared/domain/start_timer_command";
import { TimerStartedEvent } from "../../../src/shared/domain/timer_started_event";
import { TimerState } from "../../../src/main/domain/timer_state";

describe("Start timer", () => {
  describe("Start the timer with a given interval", () => {
    it("should start the timer with a given interval", () => {
      const timerState = TimerState.create();
      const handler = StartTimerCommandHandler.createNull({
        timerState,
        fixedInstant: "2025-08-28T19:41:00Z",
      });
      const trackedEvents = EventTracker.create(
        handler,
        TimerStartedEvent.TYPE,
      );

      handler.handle(StartTimerCommand.create({ interval: "PT30M" }));

      expect(timerState).toEqual<TimerState>(
        TimerState.create({ currentInterval: "PT30M" }),
      );
      expect(trackedEvents.events).toEqual<TimerStartedEvent[]>([
        expect.objectContaining({
          type: "timerStarted",
          timestamp: Temporal.Instant.from("2025-08-28T19:41:00Z"),
          interval: Temporal.Duration.from("PT30M"),
        }),
      ]);
    });
  });
});
