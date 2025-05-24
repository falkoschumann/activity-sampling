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
} from "../../src/application/activities_slice";
import { createStore } from "../../src/application/store";
import { Duration } from "../../src/domain/duration";
import {
  Failure,
  RecentActivitiesQueryResult,
} from "../../src/domain/messages";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { NotificationClient } from "../../src/infrastructure/notification_client";
import { UserApi } from "../../src/infrastructure/user_api";
import { Clock } from "../../src/util/clock";
import { Timer } from "../../src/util/timer";

describe("Activities", () => {
  // TODO Align with user stories

  describe("Ask periodically", () => {
    it("Starts countdown", () => {
      const { store, timer } = configure();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      const scheduledTasks = timer.trackScheduledTasks();

      store.dispatch(startCountdown({}));

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

      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT4M",
        percentage: 80,
        isRunning: true,
      });
      expect(shownNotifications.data).toEqual([]);
    });

    it("Restarts countdown", () => {
      const { store, notificationClient, timer } = configure();
      const shownNotifications = notificationClient.trackNotificationsShown();
      store.dispatch(durationSelected({ duration: "PT20M" }));
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Duration.parse("PT20M").seconds);

      timer.simulateTaskRun(Duration.parse("PT1M").seconds);

      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT20M",
        remaining: "PT19M",
        percentage: 5,
        isRunning: true,
      });
      expect(shownNotifications.data).toEqual([
        { title: "What are you working on?" },
      ]);
    });

    it("Stops countdown", () => {
      const { store, timer } = configure();
      const cancelledTasks = timer.trackCancelledTasks();
      store.dispatch(startCountdown({}));
      timer.simulateTaskRun(Duration.parse("PT12M").seconds);

      store.dispatch(stopCountdown({}));

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
    it("Selects duration", () => {
      const { store } = configure();

      store.dispatch(durationSelected({ duration: "PT15M" }));

      expect(selectCountdown(store.getState())).toEqual({
        duration: "PT15M",
        remaining: "PT15M",
        percentage: 0,
        isRunning: false,
      });
    });

    it("Elapses countdown", () => {
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
        { title: "What are you working on?" },
      ]);
    });
  });

  describe("Log activity", () => {
    it("Logs the activity with client, project, task and optional notes", () => {
      const { store } = configure();

      store.dispatch(changeText({ name: "client", text: "client-1" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: true,
      });

      store.dispatch(changeText({ name: "project", text: "project-1" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "project-1",
        task: "",
        notes: "",
        disabled: false,
        loggable: true,
      });

      store.dispatch(changeText({ name: "task", text: "task-1" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "",
        disabled: false,
        loggable: false,
      });

      store.dispatch(changeText({ name: "notes", text: "notes-1" }));
      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
        disabled: false,
        loggable: false,
      });
    });

    it("Logs activity", async () => {
      const commandStatus = JSON.stringify({ success: true });
      const queryResultJson = JSON.stringify({
        lastActivity: {
          start: "2025-03-10T21:00:00Z",
          duration: "PT30M",
          client: "client-1",
          project: "project-1",
          task: "task-1",
          notes: "notes-1",
        },
        workingDays: [
          {
            date: "2025-03-10",
            activities: [
              {
                start: "2025-03-10T21:00:00Z",
                duration: "PT30M",
                client: "client-1",
                project: "project-1",
                task: "task-1",
                notes: "notes-1",
              },
            ],
          },
        ],
        timeSummary: {
          hoursToday: "PT30M",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT30M",
          hoursThisMonth: "PT30M",
        },
      } as RecentActivitiesQueryResult);
      const { store, activitiesApi, clock } = configure({
        responses: [new Response(commandStatus), new Response(queryResultJson)],
      });
      const loggedActivities = activitiesApi.trackActivitiesLogged();
      store.dispatch(changeText({ name: "client", text: "client-1" }));
      store.dispatch(changeText({ name: "project", text: "project-1" }));
      store.dispatch(changeText({ name: "task", text: "task-1" }));
      store.dispatch(changeText({ name: "notes", text: "notes-1" }));

      await store.dispatch(logActivity({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
        disabled: false,
        loggable: false,
      });
      expect(selectRecentActivities(store.getState())).toEqual([
        {
          date: "2025-03-10",
          activities: [
            {
              start: "2025-03-10T21:00:00Z",
              duration: "PT30M",
              client: "client-1",
              project: "project-1",
              task: "task-1",
              notes: "notes-1",
            },
          ],
        },
      ]);
      expect(selectTimeSummary(store.getState())).toEqual({
        hoursToday: "PT30M",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT30M",
        hoursThisMonth: "PT30M",
      });
      expect(loggedActivities.data).toEqual([
        {
          start: clock.now().toISOString(),
          duration: "PT30M",
          client: "client-1",
          project: "project-1",
          task: "task-1",
          notes: "notes-1",
        },
      ]);
    });

    it("Disables form when countdown is started", async () => {
      const { store } = configure();

      await store.dispatch(startCountdown({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: true,
        loggable: true,
      });
    });

    it("Enables form when countdown is stopped", async () => {
      const { store } = configure();
      await store.dispatch(startCountdown({}));

      await store.dispatch(stopCountdown({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: true,
      });
    });

    it("Enables form when countdown is elapsed", async () => {
      const { store, timer } = configure();
      await store.dispatch(startCountdown({}));

      timer.simulateTaskRun(Duration.parse("PT30M1S").seconds);

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "",
        project: "",
        task: "",
        notes: "",
        disabled: false,
        loggable: true,
      });
    });

    it("Disables form when activity is logged and countdown is running", async () => {
      const { store, notificationClient, timer } = configure({
        responses: [
          new Response(JSON.stringify({ success: true })),
          new Response(
            JSON.stringify({
              lastActivity: {
                start: "2025-02-12T21:18",
                duration: "PT30M",
                client: "client-1",
                project: "project-1",
                task: "task-1",
              },
              workingDays: [],
              timeSummary: {
                hoursToday: "PT0S",
                hoursYesterday: "PT0S",
                hoursThisWeek: "PT0S",
                hoursThisMonth: "PT0S",
              },
            }),
          ),
        ],
      });
      const hiddenNotifications = notificationClient.trackNotificationsHidden();
      await store.dispatch(startCountdown({}));

      timer.simulateTaskRun(Duration.parse("PT30M1S").seconds);
      store.dispatch(changeText({ name: "client", text: "client-1" }));
      store.dispatch(changeText({ name: "project", text: "project-1" }));
      store.dispatch(changeText({ name: "task", text: "task-1" }));
      await store.dispatch(logActivity({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "project-1",
        task: "task-1",
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
          new Response(
            JSON.stringify({
              workingDays: [],
              timeSummary: {
                hoursToday: "PT0S",
                hoursYesterday: "PT0S",
                hoursThisWeek: "PT0S",
                hoursThisMonth: "PT0S",
              },
            }),
          ),
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

    it("Selects an activity", () => {
      const { store } = configure();

      store.dispatch(
        activitySelected({
          start: "2025-02-12T21:18",
          duration: "PT30M",
          client: "client-1",
          project: "project-1",
          task: "task-1",
          notes: "notes-1",
        }),
      );

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
        disabled: false,
        loggable: false,
      });
    });
  });

  describe("Recent activities", () => {
    it("Queries recent activities", async () => {
      const queryResultJson = JSON.stringify({
        lastActivity: {
          start: "2025-02-11T21:30",
          duration: "PT30M",
          client: "ACME Inc.",
          project: "Foobar",
          task: "Do something",
          notes: "Lorem ipsum",
        },
        workingDays: [
          {
            date: "2025-02-11",
            activities: [
              {
                start: "2025-02-11T21:30",
                duration: "PT30M",
                client: "ACME Inc.",
                project: "Foobar",
                task: "Do something",
                notes: "Lorem ipsum",
              },
            ],
          },
        ],
        timeSummary: {
          hoursToday: "PT30M",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT30M",
          hoursThisMonth: "PT30M",
        },
        timeZone: "Europe/Berlin",
      } as RecentActivitiesQueryResult);
      const { store } = configure({
        responses: [new Response(queryResultJson)],
      });

      await store.dispatch(queryRecentActivities({}));

      expect(selectCurrentActivityForm(store.getState())).toEqual({
        client: "ACME Inc.",
        project: "Foobar",
        task: "Do something",
        notes: "Lorem ipsum",
        disabled: false,
        loggable: false,
      });
      expect(selectRecentActivities(store.getState())).toEqual([
        {
          date: "2025-02-11",
          activities: [
            {
              start: "2025-02-11T21:30",
              duration: "PT30M",
              client: "ACME Inc.",
              project: "Foobar",
              task: "Do something",
              notes: "Lorem ipsum",
            },
          ],
        },
      ]);
      expect(selectTimeSummary(store.getState())).toEqual({
        hoursToday: "PT30M",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT30M",
        hoursThisMonth: "PT30M",
      });
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

      await store.dispatch(queryRecentActivities({}));

      expect(selectError(store.getState())).toEqual({
        message: "Could not get recent activities. Please try again later.",
      });
    });
  });
});

function configure({ responses }: { responses?: Response | Response[] } = {}) {
  const activitiesApi = ActivitiesApi.createNull(responses);
  const notificationClient = NotificationClient.createNull();
  const clock = Clock.createNull();
  const timer = Timer.createNull();
  const store = createStore(
    activitiesApi,
    UserApi.createNull(),
    notificationClient,
    clock,
    timer,
  );
  return { store, activitiesApi, notificationClient, clock, timer };
}
