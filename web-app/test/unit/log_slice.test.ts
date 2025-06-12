// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  activitySelected,
  changeText,
  durationSelected,
  logActivity,
  queryRecentActivities,
  selectCountdown,
  selectCurrentActivityForm,
  selectError,
  selectRecentActivities,
  selectTimeSummary,
  selectTimeZone,
  startCountdown,
  stopCountdown,
} from "../../src/application/log_slice";
import { createStore } from "../../src/application/store";
import { Clock } from "../../src/common/clock";
import { Duration } from "../../src/common/duration";
import { Failure } from "../../src/common/messages";
import { Timer } from "../../src/common/timer";
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
    it("Starts countdown with a given interval", () => {
      const { store, timer } = configure();
      const scheduledTasks = timer.trackScheduledTasks();

      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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
      const { store, notificationClient, timer } = configure();
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));

      timer.simulateTaskRun(Duration.parse("PT16M").seconds);

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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
      });
      expect(shownNotifications.data).toEqual([]);
    });

    it("Restarts countdown and enable form when countdown is elapsed", () => {
      const { store, notificationClient, timer } = configure();
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Duration.parse("PT20M").seconds);

      timer.simulateTaskRun(Duration.parse("PT1M").seconds);

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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
      const { store, timer } = configure();
      const cancelledTasks = timer.trackCancelledTasks();
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Duration.parse("PT12M").seconds);

      store.dispatch(stopCountdown({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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
      });
      expect(cancelledTasks.data).toEqual([{ timeoutId: expect.any(Number) }]);
    });
  });

  describe("Current interval", () => {
    it("Notify user when an interval is elapsed", () => {
      const { store, notificationClient, timer } = configure();
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Duration.parse("PT16M").seconds);

      timer.simulateTaskRun(Duration.parse("PT4M").seconds);

      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT0S",
        percentage: 100,
        isRunning: true,
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
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "Test client",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
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
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "Test client",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "Test client",
        project: "Test project",
        task: "Test task",
        notes: "",
        disabled: false,
        loggable: true,
      });
      store.dispatch(changeText({ name: "notes", text: "Test notes" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
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

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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

      timer.simulateTaskRun(Duration.parse("PT30M1S").seconds);
      store.dispatch(changeText({ name: "client", text: "Test client" }));
      store.dispatch(changeText({ name: "project", text: "Test project" }));
      store.dispatch(changeText({ name: "task", text: "Test task" }));
      await store.dispatch(logActivity({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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

      expect(selectCurrentActivityForm(store.getState())).toEqual({
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
          activities: [createTestActivity({ timestamp: "2024-12-18T09:30" })],
        },
        {
          date: "2024-12-17",
          activities: [
            createTestActivity({ timestamp: "2024-12-17T17:00" }),
            createTestActivity({ timestamp: "2024-12-17T16:30" }),
            createTestActivity({
              timestamp: "2024-12-17T16:00",
              task: "Other task",
              notes: "Other notes",
            }),
          ],
        },
      ]);
      expect(selectTimeZone(store.getState())).toEqual("Europe/Berlin");
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

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: false,
      });
      expect(selectRecentActivities(store.getState())).toEqual([]);
      expect(selectTimeZone(store.getState())).toEqual("Europe/Berlin");
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
