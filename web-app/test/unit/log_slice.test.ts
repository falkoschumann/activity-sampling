// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";
import { Clock } from "../../src/application/clock";

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
import { createStore } from "../../src/application/store";
import { Timer } from "../../src/application/timer";
import { Failure } from "../../src/common/messages";
import {
  createEmptyTimeSummary,
  createTestActivity,
  createTestLogActivityCommand,
  createTestRecentActivitiesQuery,
  createTestRecentActivitiesQueryResult,
  RecentActivitiesQueryResult,
} from "../../src/domain/activities";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { AuthenticationApi } from "../../src/infrastructure/authentication_api";
import { NotificationClient } from "../../src/infrastructure/notification_client";

describe("Log", () => {
  describe("Ask periodically", () => {
    it("Starts countdown with a given interval", async () => {
      const { store, timer } = configure({
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
        disabled: true,
        loggable: false,
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
      const { store, notificationClient, timer } = configure({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));

      timer.simulateTaskRun(Temporal.Duration.from("PT16M").total("seconds"));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: true,
        loggable: false,
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
      const { store, notificationClient, timer } = configure({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Temporal.Duration.from("PT20M").total("seconds"));

      timer.simulateTaskRun(Temporal.Duration.from("PT1M").total("seconds"));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT19M",
        percentage: 5,
        isRunning: true,
        isElapsed: false,
        end: "2025-06-23T15:45:00Z",
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
      const { store, timer } = configure({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const cancelledTasks = timer.trackCancelledTasks();
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Temporal.Duration.from("PT12M").total("seconds"));

      store.dispatch(stopCountdown({}));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
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
      const { store, notificationClient, timer } = configure({
        fixedDate: new Date("2025-06-23T15:25:00Z"),
      });
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Temporal.Duration.from("PT16M").total("seconds"));

      timer.simulateTaskRun(Temporal.Duration.from("PT4M").total("seconds"));

      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT20M",
        percentage: 0,
        isRunning: true,
        isElapsed: false,
        end: "2025-06-23T15:45:00Z",
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
      const { store, activitiesApi, clock } = configure({
        responses: [new Response(commandStatus), new Response(queryResultJson)],
      });
      const loggedActivities = activitiesApi.trackActivitiesLogged();

      store.dispatch(changeText({ name: "client", text: "Test client" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        disabled: false,
        loggable: true,
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
      const { store, activitiesApi, clock } = configure({
        responses: [new Response(commandStatus), new Response(queryResultJson)],
      });
      const loggedActivities = activitiesApi.trackActivitiesLogged();

      store.dispatch(changeText({ name: "client", text: "Test client" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        disabled: false,
        loggable: true,
      });
      store.dispatch(changeText({ name: "notes", text: "Test notes" }));
      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "Test notes",
        disabled: false,
        loggable: true,
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
      const { store } = configure();

      store.dispatch(
        activitySelected(createTestActivity({ notes: "Test notes" })),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "Test notes",
        disabled: false,
        loggable: true,
      });
    });

    it("Selects last activity when the application starts", async () => {
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        disabled: false,
        loggable: true,
      });
    });

    it("Disables form when activity is logged and countdown is running", async () => {
      const { store, notificationClient, timer } = configure({
        responses: [
          new Response(JSON.stringify({ success: true })),
          new Response(JSON.stringify(createTestRecentActivitiesQueryResult())),
        ],
      });
      const hiddenNotifications = notificationClient.trackNotificationsHidden();
      await store.dispatch(startCountdown({}));

      timer.simulateTaskRun(Temporal.Duration.from("PT30M1S").total("seconds"));
      store.dispatch(changeText({ name: "client", text: "Test client" }));
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      await store.dispatch(logActivity({}));

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        disabled: true,
        loggable: true,
      });
      expect(hiddenNotifications.data).toEqual([
        { title: "What are you working on?" },
      ]);
    });

    it("Handles domain error", async () => {
      const { store } = configure({
        responses: [
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
      const { store } = configure({
        responses: [
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
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        disabled: false,
        loggable: true,
      });
    });

    it("Groups activities by working days for the last 30 days", async () => {
      const queryResultJson = JSON.stringify(
        createTestRecentActivitiesQueryResult(),
      );
      const { store } = configure({
        responses: [new Response(queryResultJson)],
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
      const { store } = configure({
        responses: [new Response(queryResultJson)],
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
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(
        queryRecentActivities(createTestRecentActivitiesQuery()),
      );

      expect(selectCurrentActivity(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      expect(selectRecentActivities(store.getState())).toEqual([]);
      expect(selectTimeSummary(store.getState())).toEqual(
        createEmptyTimeSummary(),
      );
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

      await store.dispatch(queryRecentActivities({}));

      expect(selectError(store.getState())).toEqual({
        message: "Could not get recent activities. Please try again later.",
      });
    });
  });
});

function configure({
  responses,
  fixedDate,
}: {
  responses?: Response | Response[];
  fixedDate?: Date;
} = {}) {
  const activitiesApi = ActivitiesApi.createNull(responses);
  const authenticationApi = AuthenticationApi.createNull();
  const notificationClient = NotificationClient.createNull();
  const clock = Clock.createNull(fixedDate);
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
