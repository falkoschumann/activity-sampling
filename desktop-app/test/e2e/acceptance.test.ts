// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";
import { createActivitySampling } from "./activity_sampling";

describe("Activity Sampling", () => {
  it("should start timer", () => {
    const { log } = createActivitySampling();

    log.startTimer();

    log.assertTimerStarted();
  });

  it("should stop timer", () => {
    const { log } = createActivitySampling({ now: "2025-09-17T17:51:00Z" });
    log.startTimer();

    log.passTime({ duration: "PT8M" });
    log.stopTimer();

    log.assertTimerStopped({ timestamp: "2025-09-17T17:59:00Z" });
  });

  it("should query current interval", () => {
    const { log } = createActivitySampling({ now: "2025-08-29T08:19:00Z" });
    log.startTimer({ interval: "PT20M" });
    log.intervalElapsed();

    log.queryCurrentInterval();

    log.assertCurrentInterval({
      timestamp: "2025-08-29T08:39:00Z",
      duration: "PT20M",
    });
  });

  it("should log activity", async () => {
    const { log } = createActivitySampling({ now: "2025-08-29T09:42:00Z" });

    await log.logActivity({ timestamp: "2025-08-29T08:47:00Z" });

    await log.assertActivityLogged({ timestamp: "2025-08-29T08:47:00Z" });
  });

  it("should query recent activities", async () => {
    const { log } = createActivitySampling({ now: "2025-08-29T09:42:00Z" });
    await log.activityLogged({ timestamp: "2025-08-29T08:47:00Z" });
    await log.activityLogged({ timestamp: "2025-08-29T09:17:00Z" });

    await log.queryRecentActivities();

    log.assertRecentActivities({
      lastActivity: { dateTime: "2025-08-29T11:17" },
      workingDays: [
        {
          date: "2025-08-29",
          activities: [
            { dateTime: "2025-08-29T11:17" },
            { dateTime: "2025-08-29T10:47" },
          ],
        },
      ],
      timeSummary: {
        hoursToday: "PT1H",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT1H",
        hoursThisMonth: "PT1H",
      },
    });
  });

  it.todo("should query report");

  it.todo("should query timesheet");
});
