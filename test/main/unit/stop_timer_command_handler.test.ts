// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventTracker } from "@muspellheim/shared";
import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { TimerStoppedEvent } from "../../../src/shared/domain/timer_stopped_event";
import { StopTimerCommandHandler } from "../../../src/main/application/stop_timer_command_handler";
import { StopTimerCommand } from "../../../src/shared/domain/stop_timer_command";
import { TimerState } from "../../../src/main/domain/timer_state";
import { TimeoutStub } from "../../../src/main/infrastructure/timer_stub";

describe("Stop timer", () => {
  it("should stop the timer", () => {
    const handler = StopTimerCommandHandler.createNull({
      timerState: TimerState.create({
        intervalId: new TimeoutStub(),
        currentInterval: "PT30M",
      }),
      fixedInstant: "2025-08-28T19:43:00Z",
    });
    const trackedEvents = EventTracker.create(handler, TimerStoppedEvent.TYPE);

    handler.handle(StopTimerCommand.create());

    expect(trackedEvents.events).toEqual<TimerStoppedEvent[]>([
      expect.objectContaining({
        type: "timerStopped",
        timestamp: Temporal.Instant.from("2025-08-28T19:43:00Z"),
      }),
    ]);
  });
});
