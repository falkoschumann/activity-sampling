// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { createStore } from "../../src/application/store";
import {
  durationSelected,
  getRecentActivities,
  lastActivitySelected,
  logActivity,
  selectCountdown,
  selectLastActivity,
  selectTimeSummary,
  selectWorkingDays,
} from "../../src/application/activities_slice";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { Clock } from "../../src/infrastructure/clock";

describe("Activities", () => {
  it("Initial state", () => {
    const { store } = configure();

    const lastActivity = selectLastActivity(store.getState());
    const timeSummary = selectTimeSummary(store.getState());
    const workingDays = selectWorkingDays(store.getState());

    expect(lastActivity).toBeUndefined();
    expect(timeSummary).toEqual({
      hoursToday: "PT0S",
      hoursYesterday: "PT0S",
      hoursThisWeek: "PT0S",
      hoursThisMonth: "PT0S",
    });
    expect(workingDays).toEqual([]);
  });

  it("Handles duration selected", () => {
    const { store } = configure();

    store.dispatch(
      durationSelected({
        duration: "PT15M",
      }),
    );

    expect(selectCountdown(store.getState())).toEqual({
      duration: "PT15M",
      remaining: "PT30M",
      percentage: 0,
    });
  });

  it("Handles last activity selected", () => {
    const { store } = configure();

    store.dispatch(
      lastActivitySelected({
        timestamp: "2025-02-12T21:18",
        duration: "PT30M",
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
      }),
    );

    expect(selectLastActivity(store.getState())).toEqual({
      timestamp: "2025-02-12T21:18",
      duration: "PT30M",
      client: "client-1",
      project: "project-1",
      task: "task-1",
      notes: "notes-1",
    });
  });

  it("Logs activity", async () => {
    const { store, activitiesApi, clock } = configure({
      responses: new Response('{"success":true}'),
    });
    const loggedActivity = activitiesApi.trackLoggedActivity();

    await store.dispatch(
      logActivity({
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
      }),
    );

    expect(loggedActivity.data).toEqual([
      {
        timestamp: clock.now().toISOString(),
        duration: "PT30M",
        client: "client-1",
        project: "project-1",
        task: "task-1",
        notes: "notes-1",
      },
    ]);
  });

  it("Gets recent activities", async () => {
    const { store } = configure({
      responses: new Response(`{
        "lastActivity": {
          "timestamp": "2025-02-11T21:30",
          "duration": "PT30M",
          "client": "ACME Inc.",
          "project": "Foobar",
          "task": "Do something",
          "notes": "Lorem ipsum"
        },
        "workingDays": [
          {
            "date": "2025-02-11",
            "activities": [
                {
                  "timestamp": "2025-02-11T21:30",
                  "duration": "PT30M",
                  "client": "ACME Inc.",
                  "project": "Foobar",
                  "task": "Do something",
                  "notes": "Lorem ipsum"
                }
            ]
          }
        ],
        "timeSummary": {
          "hoursToday": "PT30M",
          "hoursYesterday": "PT0S",
          "hoursThisWeek": "PT30M",
          "hoursThisMonth": "PT30M"
        },
        "timeZone": "Europe/Berlin"
      }`),
    });

    await store.dispatch(getRecentActivities({}));

    expect(store.getState().activities).toEqual({
      countdown: {
        duration: "PT30M",
        remaining: "PT30M",
        percentage: 0,
      },
      lastActivity: {
        timestamp: "2025-02-11T21:30",
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
              timestamp: "2025-02-11T21:30",
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

function configure({ responses }: { responses?: Response | Response[] } = {}) {
  const activitiesApi = ActivitiesApi.createNull(responses);
  const clock = Clock.createNull();
  const store = createStore(activitiesApi, clock);
  return { store, activitiesApi, clock };
}
