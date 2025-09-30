// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import { init, PeriodUnit } from "../../../src/renderer/domain/period";

describe("Period", () => {
  describe("Initialize period", () => {
    it("should initialize with current week on Wednesday", () => {
      const state = init({ today: "2025-08-13", unit: PeriodUnit.WEEK });

      expect(state).toEqual({
        from: "2025-08-11",
        to: "2025-08-17",
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should initialize with current week on Monday", () => {
      const state = init({ today: "2025-09-29", unit: PeriodUnit.WEEK });

      expect(state).toEqual({
        from: "2025-09-29",
        to: "2025-10-05",
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should initialize with current week on Sunday", () => {
      const state = init({ today: "2025-09-28", unit: PeriodUnit.WEEK });

      expect(state).toEqual({
        from: "2025-09-22",
        to: "2025-09-28",
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should initialize current month with 30 days", () => {
      const state = init({ today: "2025-09-20", unit: PeriodUnit.MONTH });

      expect(state).toEqual({
        from: "2025-09-01",
        to: "2025-09-30",
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should initialize current month with 31 days", () => {
      const state = init({ today: "2025-08-20", unit: PeriodUnit.MONTH });

      expect(state).toEqual({
        from: "2025-08-01",
        to: "2025-08-31",
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should initialize current month with 28 days", () => {
      const state = init({ today: "2025-02-20", unit: PeriodUnit.MONTH });

      expect(state).toEqual({
        from: "2025-02-01",
        to: "2025-02-28",
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });
  });

  describe("Change period", () => {
    it.todo("should change to day");

    it.todo("should change to week");

    it.todo("should change to month");

    it.todo("should change to year");

    it.todo("should change to all the time");
  });

  describe("Go to next period", () => {
    it.todo("should go to next day");

    it.todo("should go to next week");

    it.todo("should go to next month");

    it.todo("should go to next year");
  });

  describe("Goto previous period", () => {
    it.todo("should go to previous day");

    it.todo("should go to previous week");

    it.todo("should go to previous month");

    it.todo("should go to previous year");
  });
});
