// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { CurrentIntervalQueryHandler } from "../../../src/main/application/current_interval_query_handler";
import {
  CurrentIntervalQuery,
  CurrentIntervalQueryResult,
} from "../../../src/shared/domain/current_interval_query";
import { TimerState } from "../../../src/main/domain/timer_state";
import { IntervalElapsedEvent } from "../../../src/shared/domain/interval_elapsed_event";
import { StartTimerCommand } from "../../../src/shared/domain/start_timer_command";
import { EventTracker } from "@muspellheim/shared";

describe("Current interval", () => {
  describe("Notify the user when an interval is elapsed", () => {
    it("should notify the user when an interval is elapsed", async () => {
      const handler = CurrentIntervalQueryHandler.createNull({
        timerState: TimerState.create({
          currentInterval: "PT20M",
        }),
        fixedInstant: "2025-08-28T20:11:00Z",
      });

      const result = await handler.handle(CurrentIntervalQuery.create());

      expect(result).toEqual<CurrentIntervalQueryResult>({
        timestamp: Temporal.Instant.from("2025-08-28T20:11:00Z"),
        duration: Temporal.Duration.from("PT20M"),
      });
    });

    it("should emit interval elapsed event", async () => {
      const handler = CurrentIntervalQueryHandler.createNull({
        timerState: TimerState.create({
          currentInterval: "PT20M",
        }),
        fixedInstant: "2025-08-28T19:41:00Z",
      });
      const trackedEvents = EventTracker.create(
        handler,
        IntervalElapsedEvent.TYPE,
      );
      await handler.handle(StartTimerCommand.create({ interval: "PT20M" }));

      handler.simulateIntervalElapsed();

      expect(trackedEvents.events).toEqual<IntervalElapsedEvent[]>([
        expect.objectContaining({
          type: "intervalElapsed",
          timestamp: Temporal.Instant.from("2025-08-28T19:41:00Z"),
          interval: Temporal.Duration.from("PT20M"),
        }),
      ]);
    });
  });
});
