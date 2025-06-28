// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  queryReport,
  selectEntries,
  selectError,
} from "../../src/application/reports_slice";
import { createNullStore } from "../../src/application/store";
import {
  createTestReportQuery,
  createTestReportQueryResult,
  ReportQueryResult,
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
