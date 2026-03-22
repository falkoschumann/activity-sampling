// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { CurrentIntervalQueryHandler } from "../../../src/main/application/current_interval_query_handler";
import {
  CurrentIntervalQuery,
  CurrentIntervalQueryResult,
} from "../../../src/shared/domain/current_interval_query";
import { TimerState } from "../../../src/main/domain/timer_state";
import { TimeoutStub } from "../../../src/main/infrastructure/timer_stub";

describe("Query current interval", () => {
  it("should notify the user when an interval is elapsed", async () => {
    const handler = CurrentIntervalQueryHandler.createNull({
      timerState: TimerState.create({
        intervalId: new TimeoutStub(),
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
});
