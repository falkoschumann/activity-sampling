// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";
import { TotalHoursProjection } from "../../../src/main/domain/total_hours_projection";

describe("Total hours projection", () => {
  it("should return zero when no event is logged", () => {
    const projection = TotalHoursProjection.create();

    expect(projection.get()).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT0H"),
    );
  });

  it("should accumulate total hours from logged activities", () => {
    const projection = TotalHoursProjection.create();

    projection.update(
      ActivityLoggedEvent.createTestInstance({ duration: "PT2H" }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({ duration: "PT3H30M" }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({ duration: "PT1H15M" }),
    );

    expect(projection.get()).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT6H45M"),
    );
  });
});
