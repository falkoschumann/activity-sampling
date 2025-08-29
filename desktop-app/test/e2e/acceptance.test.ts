// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";
import { createActivitySampling } from "./activity_sampling";

describe("Activity Sampling - Acceptance Tests", () => {
  it("Should start timer", () => {
    const { log } = createActivitySampling();

    log.startTimer();

    log.assertCommandWasSuccessful();
    log.assertTimerStarted();
  });

  it("Should stop timer", () => {
    const { log } = createActivitySampling();

    log.passTime();
    log.stopTimer();

    log.assertCommandWasSuccessful();
    log.assertTimerStopped();
  });

  it("Should query current interval", () => {
    const { log } = createActivitySampling();
    log.startTimer();
    log.intervalElapsed();

    log.queryCurrentInterval();

    log.assertCurrentInterval();
  });

  it("Should log activity", async () => {
    const { log } = createActivitySampling();

    await log.logActivity({ timestamp: "2025-08-26T14:00:00Z" });

    log.assertCommandWasSuccessful();
    await log.assertActivityLogged({ timestamp: "2025-08-26T14:00:00Z" });
  });

  it("Should query recent activities", async () => {
    const { log } = createActivitySampling();
    await log.activityLogged({ timestamp: "2025-08-26T13:30:00Z" });
    await log.activityLogged({ timestamp: "2025-08-26T14:00:00Z" });

    await log.queryRecentActivities();

    log.assertRecentActivities({
      lastActivity: "2025-08-26T16:00",
      workingDays: [
        {
          date: "2025-08-26",
          activities: ["2025-08-26T16:00", "2025-08-26T15:30"],
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
});
