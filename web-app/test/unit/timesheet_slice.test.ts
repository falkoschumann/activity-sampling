// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createNullStore } from "../../src/application/store";
import {
  initPeriod,
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
  TimesheetQueryResult,
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

    it("Summarizes hours worked per day when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        workingHoursSummary: createTestWorkingHoursSummary(),
      } as TimesheetQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      store.dispatch(
        initPeriod({ from: "2025-06-13", to: "2025-06-13", unit: "Day" }),
      );

      store.dispatch(nextPeriod());
      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-14",
        to: "2025-06-14",
        unit: "Day",
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
      store.dispatch(
        initPeriod({ from: "2025-06-13", to: "2025-06-13", unit: "Day" }),
      );

      store.dispatch(previousPeriod());
      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-12",
        to: "2025-06-12",
        unit: "Day",
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
      store.dispatch(
        initPeriod({ from: "2025-06-02", to: "2025-06-08", unit: "Week" }),
      );

      store.dispatch(nextPeriod());
      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-06-09",
        to: "2025-06-15",
        unit: "Week",
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
      store.dispatch(
        initPeriod({ from: "2025-06-02", to: "2025-06-08", unit: "Week" }),
      );

      store.dispatch(previousPeriod());
      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-05-26",
        to: "2025-06-01",
        unit: "Week",
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
      store.dispatch(
        initPeriod({ from: "2025-03-01", to: "2025-03-31", unit: "Month" }),
      );

      store.dispatch(nextPeriod());
      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-04-01",
        to: "2025-04-30",
        unit: "Month",
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
      store.dispatch(
        initPeriod({ from: "2025-03-01", to: "2025-03-31", unit: "Month" }),
      );

      store.dispatch(previousPeriod());
      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-02-01",
        to: "2025-02-28",
        unit: "Month",
      });
    });

    it("Summarizes the total hours worked", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectWorkingHoursSummary(store.getState()).totalHours).toEqual(
        createTestWorkingHoursSummary().totalHours,
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
