// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createNullStore } from "../../src/application/store";
import {
  changePeriod,
  nextPeriod,
  previousPeriod,
  queryTimesheet,
  selectEntries,
  selectError,
  selectPeriod,
  selectWorkingHoursSummary,
} from "../../src/application/timesheet_slice";
import {
  createTestTimesheetQuery,
  createTestTimesheetQueryResult,
  createTestWorkingHoursSummary,
  PeriodUnit,
  type TimesheetQueryResult,
} from "../../src/domain/activities";

describe("Timesheet", () => {
  describe("Timesheet", () => {
    it("Summarizes hours worked on tasks", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectEntries(store.getState())).toEqual(
        createTestTimesheetQueryResult().entries,
      );
    });

    it("Summarizes hours worked per day", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";

      store.dispatch(changePeriod({ unit: PeriodUnit.DAY, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-13",
        to: "2025-06-13",
        unit: PeriodUnit.DAY,
        isCurrent: true,
      });
    });

    it("Summarizes hours worked per day when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";
      store.dispatch(changePeriod({ unit: PeriodUnit.DAY, today }));

      store.dispatch(nextPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-14",
        to: "2025-06-14",
        unit: PeriodUnit.DAY,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per day when goto previous period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";
      store.dispatch(changePeriod({ unit: PeriodUnit.DAY, today }));

      store.dispatch(previousPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-12",
        to: "2025-06-12",
        unit: PeriodUnit.DAY,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per week", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";

      store.dispatch(changePeriod({ unit: PeriodUnit.WEEK, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-09",
        to: "2025-06-15",
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("Summarizes hours worked per week when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";
      store.dispatch(changePeriod({ unit: PeriodUnit.WEEK, today }));

      store.dispatch(nextPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-16",
        to: "2025-06-22",
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per week when goto previous period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";
      store.dispatch(changePeriod({ unit: PeriodUnit.WEEK, today }));

      store.dispatch(previousPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-02",
        to: "2025-06-08",
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per month", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";

      store.dispatch(changePeriod({ unit: PeriodUnit.MONTH, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-01",
        to: "2025-06-30",
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("Summarizes hours worked per month when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";
      store.dispatch(changePeriod({ unit: PeriodUnit.MONTH, today }));

      store.dispatch(nextPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-07-01",
        to: "2025-07-31",
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per month when goto previous period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-06-13";
      store.dispatch(changePeriod({ unit: PeriodUnit.MONTH, today }));

      store.dispatch(previousPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-05-01",
        to: "2025-05-31",
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      });
    });

    it("Summarizes the total hours worked", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectWorkingHoursSummary(store.getState())).toEqual(
        createTestWorkingHoursSummary(),
      );
    });

    it("Compares with capacity", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectWorkingHoursSummary(store.getState())).toEqual(
        createTestWorkingHoursSummary(),
      );
    });

    it("Queries empty result", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: {
          totalHours: "PT0S",
          capacity: "PT40H",
          offset: "PT0S",
        },
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectEntries(store.getState())).toEqual([]);
      expect(selectWorkingHoursSummary(store.getState())).toEqual({
        totalHours: "PT0S",
        capacity: "PT40H",
        offset: "PT0S",
      });
    });

    it("Handles server error", async () => {
      const { store } = createNullStore({
        activitiesResponses: [
          new Response("", {
            status: 500,
            statusText: "Internal Server Error",
          }),
        ],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectError(store.getState())).toEqual({
        message: "Could not get timesheet. Please try again later.",
      });
    });
  });
});
