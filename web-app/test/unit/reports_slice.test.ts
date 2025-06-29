// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  changePeriod,
  changeScope,
  nextPeriod,
  previousPeriod,
  queryReport,
  selectEntries,
  selectError,
  selectPeriod,
  selectScope,
} from "../../src/application/reports_slice";
import { createNullStore } from "../../src/application/store";
import {
  createTestReportQuery,
  createTestReportQueryResult,
  PeriodUnit,
  type ReportQueryResult,
  Scope,
} from "../../src/domain/activities";

describe("Reports", () => {
  describe("Reports", () => {
    it("Summarize hours worked for clients", async () => {
      const queryResultJson = JSON.stringify(createTestReportQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      store.dispatch(changeScope({ scope: Scope.CLIENTS }));

      await store.dispatch(
        queryReport(createTestReportQuery({ scope: Scope.CLIENTS })),
      );

      expect(selectScope(store.getState())).toEqual(Scope.CLIENTS);
      expect(selectEntries(store.getState())).toEqual(
        createTestReportQueryResult().entries,
      );
    });

    it("Summarize hours worked on projects", async () => {
      const queryResultJson = JSON.stringify(createTestReportQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      // Projects is the default scope, so no need to change it.

      await store.dispatch(
        queryReport(createTestReportQuery({ scope: Scope.PROJECTS })),
      );

      expect(selectScope(store.getState())).toEqual(Scope.PROJECTS);
      expect(selectEntries(store.getState())).toEqual(
        createTestReportQueryResult().entries,
      );
    });

    it("Summarize hours worked on tasks", async () => {
      const queryResultJson = JSON.stringify(createTestReportQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      store.dispatch(changeScope({ scope: Scope.TASKS }));

      await store.dispatch(
        queryReport(createTestReportQuery({ scope: Scope.TASKS })),
      );

      expect(selectScope(store.getState())).toEqual(Scope.TASKS);
      expect(selectEntries(store.getState())).toEqual(
        createTestReportQueryResult().entries,
      );
    });

    it("Summarizes hours worked per week", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";

      store.dispatch(changePeriod({ unit: PeriodUnit.WEEK, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-03-31",
        to: "2025-04-06",
        unit: PeriodUnit.WEEK,
        isCurrent: true,
      });
    });

    it("Summarizes hours worked per week when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";
      store.dispatch(changePeriod({ unit: PeriodUnit.WEEK, today }));

      store.dispatch(nextPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-04-07",
        to: "2025-04-13",
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per week when goto previous period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";
      store.dispatch(changePeriod({ unit: PeriodUnit.WEEK, today }));

      store.dispatch(previousPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-03-24",
        to: "2025-03-30",
        unit: PeriodUnit.WEEK,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per month", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";

      store.dispatch(changePeriod({ unit: PeriodUnit.MONTH, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-03-01",
        to: "2025-03-31",
        unit: PeriodUnit.MONTH,
        isCurrent: true,
      });
    });

    it("Summarizes hours worked per month when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";
      store.dispatch(changePeriod({ unit: PeriodUnit.MONTH, today }));

      store.dispatch(nextPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-04-01",
        to: "2025-04-30",
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per month when goto previous period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";
      store.dispatch(changePeriod({ unit: PeriodUnit.MONTH, today }));

      store.dispatch(previousPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-02-01",
        to: "2025-02-28",
        unit: PeriodUnit.MONTH,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per year", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";

      store.dispatch(changePeriod({ unit: PeriodUnit.YEAR, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2025-01-01",
        to: "2025-12-31",
        unit: PeriodUnit.YEAR,
        isCurrent: true,
      });
    });

    it("Summarizes hours worked per year when goto next period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";
      store.dispatch(changePeriod({ unit: PeriodUnit.YEAR, today }));

      store.dispatch(nextPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2026-01-01",
        to: "2026-12-31",
        unit: PeriodUnit.YEAR,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked per year when goto previous period", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";
      store.dispatch(changePeriod({ unit: PeriodUnit.YEAR, today }));

      store.dispatch(previousPeriod({ today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "2024-01-01",
        to: "2024-12-31",
        unit: PeriodUnit.YEAR,
        isCurrent: false,
      });
    });

    it("Summarizes hours worked all the time", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });
      const today = "2025-03-31";

      store.dispatch(changePeriod({ unit: PeriodUnit.ALL_TIME, today }));

      expect(selectPeriod(store.getState())).toEqual({
        from: "0000-01-01",
        to: "9999-12-31",
        unit: PeriodUnit.ALL_TIME,
        isCurrent: true,
      });
    });

    it("Queries empty result", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
      } as ReportQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryReport(createTestReportQuery()));

      expect(selectEntries(store.getState())).toEqual([]);
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

      await store.dispatch(queryReport(createTestReportQuery()));

      expect(selectError(store.getState())).toEqual({
        message: "Could not get report. Please try again later.",
      });
    });
  });
});
