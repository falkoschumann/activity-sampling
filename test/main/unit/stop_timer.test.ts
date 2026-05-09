// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventTracker } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import {
  TIMER_STOPPED_EVENT,
  TimerStoppedEvent,
} from "../../../src/shared/domain/timer_stopped_event";
import { StopTimerCommandHandler } from "../../../src/main/application/stop_timer_command_handler";
import { StopTimerCommand } from "../../../src/shared/domain/stop_timer_command";

describe("Stop timer", () => {
  describe("Stop the timer", () => {
    it("should stop the timer", () => {
      const handler = StopTimerCommandHandler.createNull({
        fixedInstant: "2025-08-28T19:43:00Z",
      });
      const trackedEvents = EventTracker.create(handler, TIMER_STOPPED_EVENT);

      handler.handle(StopTimerCommand.create());

      expect(trackedEvents.events).toEqual<TimerStoppedEvent[]>([
        expect.objectContaining({
          type: "timerStopped",
        }),
      ]);
    });
  });
});
