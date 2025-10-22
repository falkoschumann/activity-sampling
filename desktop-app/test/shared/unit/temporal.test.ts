// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { Clock, normalizeDuration } from "../../../src/shared/common/temporal";

describe("Clock", () => {
  it("should return current timestamp with system UTC", () => {
    const clock = Clock.systemUtc();

    const nowInstant = clock.instant();
    const nowMillis = clock.millis();

    expect(nowInstant.epochMilliseconds - Date.now()).lessThan(100);
    expect(nowMillis - Date.now()).lessThan(100);
    expect(clock.zone).toBe("UTC");
  });

  it("should return current timestamp with system default zone", () => {
    const clock = Clock.systemDefaultZone();

    const nowInstant = clock.instant();
    const nowMillis = clock.millis();

    expect(nowInstant.epochMilliseconds - Date.now()).lessThan(100);
    expect(nowMillis - Date.now()).lessThan(100);
    expect(clock.zone).toBe("Europe/Berlin");
  });

  it("should return fixed timestamp", () => {
    const fixed = "2025-02-19T19:44Z";
    const clock = Clock.fixed(fixed, "Europe/Berlin");

    const now = clock.instant();

    expect(now).toEqual<Temporal.Instant>(Temporal.Instant.from(fixed));
    expect(clock.zone).toBe("Europe/Berlin");
  });

  it("should return a timestamp with an offset", () => {
    const clock = Clock.fixed("2025-08-28T15:55Z", "Europe/Berlin");

    const offset = Clock.offset(clock, Temporal.Duration.from("PT5M"));

    expect(offset.instant()).toEqual<Temporal.Instant>(
      Temporal.Instant.from("2025-08-28T16:00Z"),
    );
  });
});

describe("Duration", () => {
  it("should normalizes a duration", () => {
    // 1 hour, 1 minute, 1 second
    const duration = Temporal.Duration.from("PT3661S");

    const normalized = normalizeDuration(duration);

    expect(normalized.toString()).toBe("PT1H1M1S");
  });
});
