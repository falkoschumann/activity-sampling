// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createStore } from "../../src/application/store";
import {
  queryTimesheet,
  selectCapacity,
  selectError,
  selectTimesheet,
  selectTimeZone,
  selectTotalHours,
} from "../../src/application/timesheet_slice";
import { Clock } from "../../src/common/clock";
import { Timer } from "../../src/common/timer";
import {
  createTestTimesheetQuery,
  createTestTimesheetQueryResult,
  TimesheetQueryResult,
} from "../../src/domain/activities";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { AuthenticationApi } from "../../src/infrastructure/authentication_api";
import { NotificationClient } from "../../src/infrastructure/notification_client";

describe("Timesheet", () => {
  describe("Timesheet", () => {
    it("Summarizes hours worked on tasks", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectTimesheet(store.getState())).toEqual(
        createTestTimesheetQueryResult().entries,
      );
      expect(selectTimeZone(store.getState())).toEqual(
        createTestTimesheetQueryResult().timeZone,
      );
    });

    it("Summarizes the total hours worked", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectTotalHours(store.getState())).toEqual(
        createTestTimesheetQueryResult().totalHours,
      );
    });

    it("Compares with capacity", async () => {
      const queryResultJson = JSON.stringify(createTestTimesheetQueryResult());
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectCapacity(store.getState())).toEqual(
        createTestTimesheetQueryResult().capacity,
      );
    });

    it("Queries empty result", async () => {
      const queryResultJson = JSON.stringify({
        entries: [],
        totalHours: "PT0S",
        timeZone: "Europe/Berlin",
      } as TimesheetQueryResult);
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryTimesheet(createTestTimesheetQuery()));

      expect(selectTimesheet(store.getState())).toEqual([]);
      expect(selectTotalHours(store.getState())).toEqual("PT0S");
      expect(selectTimeZone(store.getState())).toEqual("Europe/Berlin");
    });

    it("Handles server error", async () => {
      const { store } = configure({
        responses: [
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

function configure({ responses }: { responses?: Response | Response[] } = {}) {
  const activitiesApi = ActivitiesApi.createNull(responses);
  const authenticationApi = AuthenticationApi.createNull();
  const notificationClient = NotificationClient.createNull();
  const clock = Clock.createNull();
  const timer = Timer.createNull();
  const store = createStore({
    activitiesApi,
    authenticationApi,
    notificationClient,
    clock,
    timer,
  });
  return { store, activitiesApi, notificationClient, clock, timer };
}
