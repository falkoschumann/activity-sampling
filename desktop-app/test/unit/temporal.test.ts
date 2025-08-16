// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Clock, normalizeDuration } from "../../src/main/common/temporal";
import { Temporal } from "@js-temporal/polyfill";

describe("Temporal", () => {
  describe("Clock", () => {
    it("Returns now with system UTC", () => {
      const clock = Clock.systemUtc();

      const now = clock.instant();

      const duration = now.epochMilliseconds - Date.now();
      expect(duration).lessThan(100);
      expect(clock.zone).toEqual("UTC");
    });

    it("Returns now with system default zone", () => {
      const clock = Clock.systemDefaultZone();

      const now = clock.instant();

      const duration = now.epochMilliseconds - Date.now();
      expect(duration).lessThan(100);
      expect(clock.zone).toEqual("Europe/Berlin");
    });

    it("Returns fixed", () => {
      const fixed = "2025-02-19T19:44Z";
      const clock = Clock.fixed(fixed, "Europe/Berlin");

      const now = clock.instant();

      expect(now).toEqual(Temporal.Instant.from(fixed));
      expect(clock.zone).toEqual("Europe/Berlin");
    });
  });

  describe("Duration", () => {
    it("Normalizes", () => {
      // 1 hour, 1 minute, 1 second
      const duration = Temporal.Duration.from("PT3661S");

      const normalized = normalizeDuration(duration);

      expect(normalized.toString()).toEqual("PT1H1M1S");
    });
  });
});
