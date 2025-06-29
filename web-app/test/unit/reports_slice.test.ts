// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  changePeriod,
  initPeriod,
  nextPeriod,
  previousPeriod,
  queryReport,
  selectEntries,
  selectError,
  selectPeriod,
} from "../../src/application/reports_slice";
import { createNullStore } from "../../src/application/store";
import {
  createTestReportQuery,
  createTestReportQueryResult,
  type ReportQueryResult,
} from "../../src/domain/activities";

describe("Reports", () => {
  describe("Reports", () => {
    it("Summarize hours worked on projects", async () => {
      const queryResultJson = JSON.stringify(createTestReportQueryResult());
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryReport(createTestReportQuery()));

      expect(selectEntries(store.getState())).toEqual(
        createTestReportQueryResult().entries,
      );
    });
  });

  it("Summarizes hours worked per day when goto next period", async () => {
    const queryResultJson = JSON.stringify({
      entries: [],
    } as ReportQueryResult);
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
    } as ReportQueryResult);
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
    } as ReportQueryResult);
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
    } as ReportQueryResult);
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
    } as ReportQueryResult);
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
    } as ReportQueryResult);
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

  it("Summarizes hours worked per year when goto next period", async () => {
    const queryResultJson = JSON.stringify({
      entries: [],
    } as ReportQueryResult);
    const { store } = createNullStore({
      activitiesResponses: [new Response(queryResultJson)],
    });
    store.dispatch(
      initPeriod({ from: "2025-01-01", to: "2025-12-31", unit: "Year" }),
    );

    store.dispatch(nextPeriod());
    expect(selectPeriod(store.getState())).toEqual({
      from: "2026-01-01",
      to: "2026-12-31",
      unit: "Year",
    });
  });

  it("Summarizes hours worked per year when goto previous period", async () => {
    const queryResultJson = JSON.stringify({
      entries: [],
    } as ReportQueryResult);
    const { store } = createNullStore({
      activitiesResponses: [new Response(queryResultJson)],
    });
    store.dispatch(
      initPeriod({ from: "2025-01-01", to: "2025-12-31", unit: "Year" }),
    );

    store.dispatch(previousPeriod());
    expect(selectPeriod(store.getState())).toEqual({
      from: "2024-01-01",
      to: "2024-12-31",
      unit: "Year",
    });
  });

  it("Summarizes hours worked all the time", async () => {
    const queryResultJson = JSON.stringify({
      entries: [],
    } as ReportQueryResult);
    const { store } = createNullStore({
      activitiesResponses: [new Response(queryResultJson)],
    });
    store.dispatch(
      initPeriod({ from: "2025-06-13", to: "2025-06-13", unit: "Day" }),
    );

    store.dispatch(changePeriod({ unit: "All time" }));

    expect(selectPeriod(store.getState())).toEqual({
      from: "0000-01-01",
      to: "9999-12-31",
      unit: "All time",
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
