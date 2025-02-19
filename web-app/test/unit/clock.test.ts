// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Clock } from "../../src/infrastructure/clock";

describe("Clock", () => {
  it("Returns current date", () => {
    const clock = Clock.create();

    const now = clock.now();

    const duration = now.getTime() - Date.now();
    expect(duration).lessThan(100);
  });

  describe("Nullable", () => {
    it("Returns fixed date", () => {
      const fixedDate = new Date("2025-02-19T19:44Z");
      const clock = Clock.createNull(fixedDate);

      const now = clock.now();

      expect(now).toEqual(fixedDate);
    });
  });
});
