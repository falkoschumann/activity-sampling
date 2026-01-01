// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import {
  changePeriod,
  goToNextPeriod,
  goToPreviousPeriod,
  init,
  PeriodUnit,
  reducer,
  type State,
} from "../../../src/renderer/domain/period";

describe("Period", () => {
  describe("Initialize period", () => {
    it("should initialize with current timestamp", () => {
      const state = init({ unit: PeriodUnit.DAY });

      expect(state).toEqual<State>({
        from: Temporal.Now.plainDateISO(),
        to: Temporal.Now.plainDateISO(),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      });
    });

    it("should initialize with current day", () => {
      const state = init({ today: "2025-08-13", unit: PeriodUnit.DAY });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-08-13"),
        to: Temporal.PlainDate.from("2025-08-13"),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      });
    });

    it("should initialize with current week on Wednesday", () => {
      const state = init({ today: "2025-08-13", unit: PeriodUnit.WEEK });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-08-11"),
        to: Temporal.PlainDate.from("2025-08-17"),
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should initialize with current week on Monday", () => {
      const state = init({ today: "2025-09-29", unit: PeriodUnit.WEEK });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-29"),
        to: Temporal.PlainDate.from("2025-10-05"),
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should initialize with current week on Sunday", () => {
      const state = init({ today: "2025-09-28", unit: PeriodUnit.WEEK });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-22"),
        to: Temporal.PlainDate.from("2025-09-28"),
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should initialize current month with 30 days", () => {
      const state = init({ today: "2025-09-20", unit: PeriodUnit.MONTH });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should initialize current month with 31 days", () => {
      const state = init({ today: "2025-08-20", unit: PeriodUnit.MONTH });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-08-01"),
        to: Temporal.PlainDate.from("2025-08-31"),
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should initialize current month with 28 days", () => {
      const state = init({ today: "2025-02-20", unit: PeriodUnit.MONTH });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-02-01"),
        to: Temporal.PlainDate.from("2025-02-28"),
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should initialize with current quarter", () => {
      const state = init({ today: "2025-10-19", unit: PeriodUnit.QUARTER });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.QUARTER,
        isCurrent: true,
      });
    });

    it("should initialize with current half year", () => {
      const state = init({ today: "2025-04-01", unit: PeriodUnit.HALF_YEAR });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-01-01"),
        to: Temporal.PlainDate.from("2025-06-30"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: true,
      });
    });

    it("should initialize with current year", () => {
      const state = init({ today: "2025-08-13", unit: PeriodUnit.YEAR });

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-01-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: true,
      });
    });
  });

  describe("Change period", () => {
    it("should change to day", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-08-11"),
        to: Temporal.PlainDate.from("2025-08-17"),
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.DAY, today: "2025-09-13" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-13"),
        to: Temporal.PlainDate.from("2025-09-13"),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      });
    });

    it("should change to week", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-13"),
        to: Temporal.PlainDate.from("2025-09-13"),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.WEEK, today: "2025-09-13" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-08"),
        to: Temporal.PlainDate.from("2025-09-14"),
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should change to month", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-08-11"),
        to: Temporal.PlainDate.from("2025-08-17"),
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.MONTH, today: "2025-09-13" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should change to quarter", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-07-01"),
        to: Temporal.PlainDate.from("2025-07-31"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.QUARTER, today: "2025-10-19" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.QUARTER,
        isCurrent: true,
      });
    });

    it("should change to half year", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-13"),
        to: Temporal.PlainDate.from("2025-09-13"),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.HALF_YEAR, today: "2025-09-13" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-07-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: true,
      });
    });

    it("should change to year", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.YEAR, today: "2025-04-01" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-01-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: true,
      });
    });

    it("should change to all the time", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      };

      state = reducer(
        state,
        changePeriod({ unit: PeriodUnit.ALL_TIME, today: "2025-04-01" }),
      );

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("0000-01-01"),
        to: Temporal.PlainDate.from("9999-12-31"),
        unit: PeriodUnit.ALL_TIME,
        isCurrent: true,
      });
    });
  });

  describe("Go to the next period", () => {
    it("should go to the next day", () => {
      let state = init({ today: "2025-09-20", unit: PeriodUnit.DAY });

      state = reducer(state, goToNextPeriod({ today: "2025-09-20" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-21"),
        to: Temporal.PlainDate.from("2025-09-21"),
        unit: PeriodUnit.DAY,
        isCurrent: false,
      });
    });

    it("should go to the next day when next day is today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-21"),
        to: Temporal.PlainDate.from("2025-09-21"),
        unit: PeriodUnit.DAY,
        isCurrent: false,
      };

      state = reducer(state, goToNextPeriod({ today: "2025-09-22" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-22"),
        to: Temporal.PlainDate.from("2025-09-22"),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      });
    });

    it("should go to the next week", () => {
      let state = init({ today: "2025-10-01", unit: PeriodUnit.WEEK });

      state = reducer(state, goToNextPeriod({ today: "2025-10-01" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-06"),
        to: Temporal.PlainDate.from("2025-10-12"),
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      });
    });

    it("should go to the next week when next week contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-10-06"),
        to: Temporal.PlainDate.from("2025-10-12"),
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      };

      state = reducer(state, goToNextPeriod({ today: "2025-10-15" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-13"),
        to: Temporal.PlainDate.from("2025-10-19"),
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should go to the next month", () => {
      let state = init({ today: "2025-09-15", unit: PeriodUnit.MONTH });

      state = reducer(state, goToNextPeriod({ today: "2025-09-15" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-01"),
        to: Temporal.PlainDate.from("2025-10-31"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      });
    });

    it("should go to the next month when next month contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-10-01"),
        to: Temporal.PlainDate.from("2025-10-31"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      };

      state = reducer(state, goToNextPeriod({ today: "2025-11-12" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-11-01"),
        to: Temporal.PlainDate.from("2025-11-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should go to the next quarter", () => {
      let state = init({ today: "2025-09-15", unit: PeriodUnit.QUARTER });

      state = reducer(state, goToNextPeriod({ today: "2025-09-15" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.QUARTER,
        isCurrent: false,
      });
    });

    it("should go to the next quarter when next quarter contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-07-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.QUARTER,
        isCurrent: false,
      };

      state = reducer(state, goToNextPeriod({ today: "2025-10-19" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-10-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.QUARTER,
        isCurrent: true,
      });
    });

    it("should go to the next half year", () => {
      let state = init({ today: "2025-04-01", unit: PeriodUnit.HALF_YEAR });

      state = reducer(state, goToNextPeriod({ today: "2025-04-01" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-07-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: false,
      });
    });

    it("should go to the next half year when next half year contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-01-01"),
        to: Temporal.PlainDate.from("2025-06-30"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: false,
      };

      state = reducer(state, goToNextPeriod({ today: "2025-10-19" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-07-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: true,
      });
    });

    it("should go to the next year", () => {
      let state = init({ today: "2025-09-15", unit: PeriodUnit.YEAR });

      state = reducer(state, goToNextPeriod({ today: "2025-09-15" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2026-01-01"),
        to: Temporal.PlainDate.from("2026-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: false,
      });
    });

    it("should go to the next year when next year contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2026-01-01"),
        to: Temporal.PlainDate.from("2026-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: false,
      };

      state = reducer(state, goToNextPeriod({ today: "2027-04-01" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2027-01-01"),
        to: Temporal.PlainDate.from("2027-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: true,
      });
    });
  });

  describe("Go to the previous period", () => {
    it("should go to the previous day", () => {
      let state = init({ today: "2025-09-20", unit: PeriodUnit.DAY });

      state = reducer(state, goToPreviousPeriod({ today: "2025-09-20" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-19"),
        to: Temporal.PlainDate.from("2025-09-19"),
        unit: PeriodUnit.DAY,
        isCurrent: false,
      });
    });

    it("should go to the previous day when previous day is today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-19"),
        to: Temporal.PlainDate.from("2025-09-19"),
        unit: PeriodUnit.DAY,
        isCurrent: false,
      };

      state = reducer(state, goToPreviousPeriod({ today: "2025-09-18" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-18"),
        to: Temporal.PlainDate.from("2025-09-18"),
        unit: PeriodUnit.DAY,
        isCurrent: true,
      });
    });

    it("should go to the previous week", () => {
      let state = init({ today: "2025-10-01", unit: PeriodUnit.WEEK });

      state = reducer(state, goToPreviousPeriod({ today: "2025-10-01" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-22"),
        to: Temporal.PlainDate.from("2025-09-28"),
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      });
    });

    it("should go to the previous week when previous week contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-22"),
        to: Temporal.PlainDate.from("2025-09-28"),
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      };

      state = reducer(state, goToPreviousPeriod({ today: "2025-09-19" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-15"),
        to: Temporal.PlainDate.from("2025-09-21"),
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("should go to the previous month", () => {
      let state = init({ today: "2025-10-15", unit: PeriodUnit.MONTH });

      state = reducer(state, goToPreviousPeriod({ today: "2025-10-15" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-09-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      });
    });

    it("should go to the previous month when previous month contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-09-01"),
        to: Temporal.PlainDate.from("2025-09-30"),
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      };

      state = reducer(state, goToPreviousPeriod({ today: "2025-08-31" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-08-01"),
        to: Temporal.PlainDate.from("2025-08-31"),
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("should go to the previous quarter", () => {
      let state = init({ today: "2025-03-01", unit: PeriodUnit.QUARTER });

      state = reducer(state, goToPreviousPeriod({ today: "2025-03-01" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2024-10-01"),
        to: Temporal.PlainDate.from("2024-12-31"),
        unit: PeriodUnit.QUARTER,
        isCurrent: false,
      });
    });

    it("should go to the previous quarter when previous quarter contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2024-10-01"),
        to: Temporal.PlainDate.from("2024-12-31"),
        unit: PeriodUnit.QUARTER,
        isCurrent: false,
      };

      state = reducer(state, goToPreviousPeriod({ today: "2024-08-21" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2024-07-01"),
        to: Temporal.PlainDate.from("2024-09-30"),
        unit: PeriodUnit.QUARTER,
        isCurrent: true,
      });
    });

    it("should go to the previous half year", () => {
      let state = init({ today: "2025-04-01", unit: PeriodUnit.HALF_YEAR });

      state = reducer(state, goToPreviousPeriod({ today: "2025-04-01" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2024-07-01"),
        to: Temporal.PlainDate.from("2024-12-31"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: false,
      });
    });

    it("should go to the previous half year when previous half year contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2025-07-01"),
        to: Temporal.PlainDate.from("2025-12-31"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: false,
      };

      state = reducer(state, goToPreviousPeriod({ today: "2025-05-21" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2025-01-01"),
        to: Temporal.PlainDate.from("2025-06-30"),
        unit: PeriodUnit.HALF_YEAR,
        isCurrent: true,
      });
    });

    it("should go to the previous year", () => {
      let state = init({ today: "2025-09-15", unit: PeriodUnit.YEAR });

      state = reducer(state, goToPreviousPeriod({ today: "2025-09-15" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2024-01-01"),
        to: Temporal.PlainDate.from("2024-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: false,
      });
    });

    it("should go to the previous year when previous year contains today", () => {
      let state: State = {
        from: Temporal.PlainDate.from("2024-01-01"),
        to: Temporal.PlainDate.from("2024-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: false,
      };

      state = reducer(state, goToPreviousPeriod({ today: "2023-05-21" }));

      expect(state).toEqual<State>({
        from: Temporal.PlainDate.from("2023-01-01"),
        to: Temporal.PlainDate.from("2023-12-31"),
        unit: PeriodUnit.YEAR,
        isCurrent: true,
      });
    });
  });
});
