// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  activitySelected,
  changeText,
  durationSelected,
  logActivity,
  queryRecentActivities,
  selectCountdown,
  selectCurrentActivity,
  selectError,
  selectRecentActivities,
  selectTimeSummary,
  startCountdown,
  stopCountdown,
} from "../../src/application/log_slice";
import { createNullStore } from "../../src/application/store";
import { Failure } from "../../src/common/messages";
import {
  createEmptyTimeSummary,
  createTestActivity,
  createTestLogActivityCommand,
  createTestRecentActivitiesQuery,
  createTestRecentActivitiesQueryResult,
  type RecentActivitiesQueryResult,
} from "../../src/domain/activities";

describe("Log", () => {
  describe("Ask periodically", () => {
    it("Starts countdown with a given interval", async () => {
      const { store, timer } = createNullStore({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const scheduledTasks = timer.trackScheduledTasks();

      store.dispatch(durationSelected({ duration: "PT20M" }));
      await store.dispatch(startCountdown({}));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        isDisabled: true,
        isLoggable: false,
      });
      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT20M",
        percentage: 0,
        isRunning: true,
        isElapsed: false,
        end: "2025-06-23T15:45:00Z",
      });
      expect(scheduledTasks.data).toEqual([
        {
          timeoutId: expect.any(Number),
          delayOrFirstTime: 0,
          period: 1000,
        },
      ]);
    });

    it("Progresses countdown", () => {
      const { store, clock, notificationClient, timer } = createNullStore({
        fixedDate: "2025-06-23T15:25:00Z",
      });
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));

      clock.setFixedDate("2025-06-23T15:41:00Z");
      timer.simulateTaskRun();

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        isDisabled: true,
        isLoggable: false,
      });
      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT4M",
        percentage: 80,
        isRunning: true,
        isElapsed: false,
        end: "2025-06-23T15:45:00Z",
      });
      expect(shownNotifications.data).toEqual([]);
    });

    it("Restarts countdown and enable form when countdown is elapsed", () => {
      const { store, clock, notificationClient, timer } = createNullStore({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));

      clock.setFixedDate("2025-06-23T15:46:00Z");
      timer.simulateTaskRun();

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT19M",
        percentage: 5,
        isRunning: true,
        isElapsed: false,
        end: "2025-06-23T16:05:00Z",
      });
      expect(shownNotifications.data).toEqual([
        {
          title: "What are you working on?",
          icon: expect.any(String),
          requireInteraction: true,
        },
      ]);
    });

    it("Stops countdown and enables form", () => {
      const { store, clock, timer } = createNullStore({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const cancelledTasks = timer.trackCancelledTasks();
      store.dispatch(startCountdown({}));
      clock.setFixedDate("2025-06-23T15:37:00Z");
      timer.simulateTaskRun();

      store.dispatch(stopCountdown({}));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT30M",
        remaining: "PT18M",
        percentage: 40,
        isRunning: false,
        isElapsed: false,
        end: "2025-06-23T15:55:00Z",
      });
      expect(cancelledTasks.data).toEqual([{ timeoutId: expect.any(Number) }]);
    });
  });

  describe("Current interval", () => {
    it("Notify user when an interval is elapsed", () => {
      const { store, clock, notificationClient, timer } = createNullStore({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));

      clock.setFixedDate("2025-06-23T15:45:00Z");
      timer.simulateTaskRun();

      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT20M",
        percentage: 0,
        isRunning: true,
        isElapsed: false,
        end: "2025-06-23T16:05:00Z",
      });
      expect(shownNotifications.data).toEqual([
        {
          title: "What are you working on?",
          icon: expect.any(String),
          requireInteraction: true,
        },
      ]);
    });
  });

  describe("Log activity", () => {
    it("Logs activity", async () => {
      const commandStatus = JSON.stringify({ success: true });
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store, activitiesApi, clock } = createNullStore({
        activitiesResponses: [
          new Response(commandStatus),
          new Response(queryResultJson),
        ],
      });
      const loggedActivities = activitiesApi.trackActivitiesLogged();

      store.dispatch(changeText({ name: "client", text: "Test client" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        isDisabled: false,
        isLoggable: true,
      });

      await store.dispatch(logActivity({}));

      expect(loggedActivities.data).toEqual([
        createTestLogActivityCommand({ timestamp: clock.now().toISOString() }),
      ]);
    });

    it("Logs activity with optional notes", async () => {
      const commandStatus = JSON.stringify({ success: true });
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store, activitiesApi, clock } = createNullStore({
        activitiesResponses: [
          new Response(commandStatus),
          new Response(queryResultJson),
        ],
      });
      const loggedActivities = activitiesApi.trackActivitiesLogged();

      store.dispatch(changeText({ name: "client", text: "Test client" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        isDisabled: false,
        isLoggable: true,
      });
      store.dispatch(changeText({ name: "notes", text: "Test notes" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "Test notes",
        isDisabled: false,
        isLoggable: true,
      });

      await store.dispatch(logActivity({}));

      expect(loggedActivities.data).toEqual([
        createTestLogActivityCommand({
          timestamp: clock.now().toISOString(),
          notes: "Test notes",
        }),
      ]);
    });

    it("Selects an activity from recent activities", () => {
      const { store } = createNullStore();

      store.dispatch(
        activitySelected(createTestActivity({ notes: "Test notes" })),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "Test notes",
        isDisabled: false,
        isLoggable: true,
      });
    });

    it("Selects last activity when the application starts", async () => {
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        isDisabled: false,
        isLoggable: true,
      });
    });

    it("Disables form when activity is logged and countdown is running", async () => {
      const { store, clock, notificationClient, timer } = createNullStore({
        activitiesResponses: [
          new Response(JSON.stringify({ success: true })),
          new Response(JSON.stringify(createTestRecentActivitiesQueryResult())),
        ],
        fixedDate: "2025-06-23T15:25:00Z",
      });
      const hiddenNotifications = notificationClient.trackNotificationsHidden();
      await store.dispatch(startCountdown({}));

      clock.setFixedDate("2025-06-23T15:55:01Z");
      timer.simulateTaskRun();
      store.dispatch(changeText({ name: "client", text: "Test client" }));
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      await store.dispatch(logActivity({}));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        isDisabled: true,
        isLoggable: true,
      });
      expect(hiddenNotifications.data).toEqual([
        { title: "What are you working on?" },
      ]);
    });

    it("Handles domain error", async () => {
      const { store } = createNullStore({
        activitiesResponses: [
          new Response(JSON.stringify(new Failure("Domain error."))),
          new Response(JSON.stringify(createTestRecentActivitiesQueryResult())),
        ],
      });
      store.dispatch(changeText({ name: "client", text: "client-1" }));
      store.dispatch(changeText({ name: "project", text: "project-1" }));
      store.dispatch(changeText({ name: "task", text: "task-1" }));

      await store.dispatch(logActivity({}));

      expect(selectError(store.getState())).toEqual({
        message: "Could not log activity. Domain error.",
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
      store.dispatch(changeText({ name: "client", text: "client-1" }));
      store.dispatch(changeText({ name: "project", text: "project-1" }));
      store.dispatch(changeText({ name: "task", text: "task-1" }));

      await store.dispatch(logActivity({}));

      expect(selectError(store.getState())).toEqual({
        message: "Could not log activity. Please try again later.",
      });
    });
  });

  describe("Recent activities", () => {
    it("Returns last activity", async () => {
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        isDisabled: false,
        isLoggable: true,
      });
    });

    it("Groups activities by working days for the last 30 days", async () => {
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectRecentActivities(store.getState())).toEqual([
        {
          date: "2024-12-18",
          activities: [createTestActivity({ dateTime: "2024-12-18T09:30" })],
        },
        {
          date: "2024-12-17",
          activities: [
            createTestActivity({ dateTime: "2024-12-17T17:00" }),
            createTestActivity({ dateTime: "2024-12-17T16:30" }),
            createTestActivity({
              dateTime: "2024-12-17T16:00",
              task: "Other task",
              notes: "Other notes",
            }),
          ],
        },
      ]);
    });

    it("Summarizes hours worked today, yesterday, this week and this month", async () => {
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectTimeSummary(store.getState())).toEqual({
        hoursToday: "PT30M",
        hoursYesterday: "PT1H30M",
        hoursThisWeek: "PT2H",
        hoursThisMonth: "PT2H",
      });
    });

    it("Queries empty result", async () => {
      const queryResultJson = JSON.stringify({
        workingDays: [],
        timeSummary: createEmptyTimeSummary(),
        timeZone: "Europe/Berlin",
      } as RecentActivitiesQueryResult);
      const { store } = createNullStore({
        activitiesResponses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        isDisabled: false,
        isLoggable: false,
      });
      expect(selectRecentActivities(store.getState())).toEqual([]);
      expect(selectTimeSummary(store.getState())).toEqual(
        createEmptyTimeSummary(),
      );
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

      await store.dispatch(queryRecentActivities({}));

      expect(selectError(store.getState())).toEqual({
        message: "Could not get recent activities. Please try again later.",
      });
    });
  });
});
