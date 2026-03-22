// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventTracker } from "@muspellheim/shared";
import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { StartTimerCommandHandler } from "../../../src/main/application/start_timer_command_handler";
import { TimerStartedEvent } from "../../../src/shared/domain/timer_started_event";
import { StartTimerCommand } from "../../../src/shared/domain/start_timer_command";
import { TimerState } from "../../../src/main/domain/timer_state";
import { IntervalElapsedEvent } from "../../../src/shared/domain/interval_elapsed_event";

describe("Start timer", () => {
  it("should start the timer with a given interval", () => {
    const handler = StartTimerCommandHandler.createNull({
      timerState: TimerState.create(),
      fixedInstant: "2025-08-28T19:41:00Z",
    });
    const trackedEvents = EventTracker.create(handler, TimerStartedEvent.TYPE);

    handler.handle(StartTimerCommand.create({ interval: "PT30M" }));

    expect(trackedEvents.events).toEqual<TimerStartedEvent[]>([
      expect.objectContaining({
        type: "timerStarted",
        timestamp: Temporal.Instant.from("2025-08-28T19:41:00Z"),
        interval: Temporal.Duration.from("PT30M"),
      }),
    ]);
  });

  it("should emot interval elapsed event", async () => {
    const handler = StartTimerCommandHandler.createNull({
      timerState: TimerState.create(),
      fixedInstant: "2025-08-28T19:41:00Z",
    });
    const trackedEvents = EventTracker.create(
      handler,
      IntervalElapsedEvent.TYPE,
    );
    await handler.handle(StartTimerCommand.create({ interval: "PT20M" }));

    await handler.simulateIntervalElapsed();

    expect(trackedEvents.events).toEqual<IntervalElapsedEvent[]>([
      expect.objectContaining({
        type: "intervalElapsed",
        timestamp: Temporal.Instant.from("2025-08-28T20:01:00Z"),
        interval: Temporal.Duration.from("PT20M"),
      }),
    ]);
  });
});
