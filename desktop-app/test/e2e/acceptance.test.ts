// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";
import { SystemUnderTest } from "./system_under_test";

describe("Activity Sampling - Acceptance Tests", () => {
  it("Should ask periodically", async () => {
    const sut = new SystemUnderTest({ fixedClock: "2025-08-28T08:18:00Z" });
    await sut.start();

    await sut.askPeriodically();

    sut.assertCommandWasSuccessful();
    await sut.assertTimerStarted({ timestamp: "2025-08-28T08:18:00Z" });
  });
  it("Should log activity", async () => {
    const sut = new SystemUnderTest();
    await sut.start();

    await sut.logActivity({ timestamp: "2025-08-26T14:00:00Z" });

    sut.assertCommandWasSuccessful();
    await sut.assertActivityLogged({ timestamp: "2025-08-26T14:00:00Z" });
  });

  it("Should query recent activities", async () => {
    const sut = new SystemUnderTest();
    await sut.start();
    await sut.activityLogged({ timestamp: "2025-08-26T13:30:00Z" });
    await sut.activityLogged({ timestamp: "2025-08-26T14:00:00Z" });

    await sut.queryRecentActivities();

    sut.assertRecentActivities({
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
