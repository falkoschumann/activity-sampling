// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  durationSelected,
  getRecentActivities,
  lastActivitySelected,
  logActivity,
  selectCountdown,
  selectLastActivity,
  startCountdown,
  stopCountdown,
} from "../../src/application/activities_slice";
import { createStore } from "../../src/application/store";
import { Duration } from "../../src/domain/duration";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { Clock } from "../../src/util/clock";
import { Timer } from "../../src/util/timer";
import { NotificationClient } from "../../src/infrastructure/notification_client";

describe("Activities", () => {
  describe("Ask periodically", () => {
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
  });

  describe.todo("Current interval");

  describe.todo("Log activity");

  describe.todo("Recent activity");

  // TODO Move to commands and queries above

  describe("Progress countdown", () => {
    it("Handles countdown progressed", () => {
      const { store, notificationsClient, timer } = configure();
      const shownNotifications = notificationsClient.trackNotificationsShown();
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

    it("Handles countdown elapsed", () => {
      const { store, notificationsClient, timer } = configure();
      const shownNotifications = notificationsClient.trackNotificationsShown();
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

    it("Handles countdown restarted", () => {
      const { store, notificationsClient, timer } = configure();
      const shownNotifications = notificationsClient.trackNotificationsShown();
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
  });

  it("Handles countdown stopped", () => {
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

  it("Handles last activity selected", () => {
    const { store } = configure();

    store.dispatch(
      lastActivitySelected({
        start: "2025-02-12T21:18",
        duration: "PT30M",
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
      }),
    );

    expect(selectLastActivity(store.getState())).toEqual({
      start: "2025-02-12T21:18",
      duration: "PT30M",
      client: "client-1",
      project: "project-1",
      task: "task-1",
      notes: "notes-1",
    });
  });

  it("Logs activity", async () => {
    // FIXME TypeError: Body is unusable: Body has already been read
    const { store, activitiesApi, clock } = configure({
      responses: new Response('{"success":true}'),
    });
    const loggedActivities = activitiesApi.trackActivitiesLogged();

    await store.dispatch(
      logActivity({
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
      }),
    );

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

  it("Gets recent activities", async () => {
    const body = JSON.stringify({
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
    });
    const { store } = configure({ responses: new Response(body) });

    await store.dispatch(getRecentActivities({}));

    expect(store.getState().activities).toEqual({
      countdown: {
        duration: "PT30M",
        remaining: "PT30M",
        percentage: 0,
        isRunning: false,
      },
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
    });
  });
});

function configure({
  responses,
}: {
  responses?: Response | Response[];
} = {}) {
  const activitiesApi = ActivitiesApi.createNull(responses);
  const notificationsClient = NotificationClient.createNull();
  const clock = Clock.createNull();
  const timer = Timer.createNull();
  const store = createStore(activitiesApi, notificationsClient, clock, timer);
  return { store, activitiesApi, notificationsClient, clock, timer };
}
