// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";
import { createActivitySampling } from "./activity_sampling";

describe("Activity Sampling", () => {
  describe("Start Timer", () => {
    describe("Start the timer with the default interval when the application starts", () => {
      it.todo("should start timer at application start");
    });

    describe("Start the timer with a given interval", () => {
      it("should start timer", () => {
        const { log } = createActivitySampling();

        log.startTimer();

        log.assertTimerStarted();
      });
    });
  });

  describe("Stop Timer", () => {
    describe("Stop the timer", () => {
      it("should stop timer", () => {
        const { log } = createActivitySampling({ now: "2025-09-17T17:51:00Z" });
        log.startTimer();

        log.passTime({ duration: "PT8M" });
        log.stopTimer();

        log.assertTimerStopped({ timestamp: "2025-09-17T17:59:00Z" });
      });
    });
  });

  describe("Current Interval", () => {
    describe("Notify the user when an interval is elapsed", () => {
      it("should notify user", () => {
        const { log } = createActivitySampling({ now: "2025-08-29T08:19:00Z" });
        log.startTimer({ interval: "PT20M" });
        log.intervalElapsed();

        log.queryCurrentInterval();

        log.assertCurrentInterval({
          timestamp: "2025-08-29T08:39:00Z",
          duration: "PT20M",
        });
      });
    });
  });

  describe("Log Activity", () => {
    describe("Log the activity with a client, a project, a task and optional notes", () => {
      it.todo("should log without an optional notes", async () => {
        const { log } = createActivitySampling({ now: "2025-08-29T09:42:00Z" });

        await log.logActivity({ timestamp: "2025-08-29T08:47:00Z" });

        await log.assertActivityLogged({ timestamp: "2025-08-29T08:47:00Z" });
      });
      it.todo("should log with an optional notes");
    });

    describe("Select an activity from recent activities", () => {
      // TODO this is not spec, it is design
      it.todo("should select an existing activity");
    });

    describe("Select the last activity when the application starts", () => {
      // TODO this is not spec, it is design
      it.todo("should return the last activity");
      it.todo("should return nothing when there is no activity");
    });
  });

  describe("Recent Activities", () => {
    describe("Return last activity", () => {
      it("should return last activity", async () => {
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
    });

    describe("Group activities by working days for the last 30 days", () => {
      it.todo("should return activities");
    });

    describe("Summarize hours worked today, yesterday, this week and this month", () => {
      it.todo("should return summary");
    });
  });

  describe("Reports", () => {
    describe("Summarize hours worked for clients", () => {
      it.todo("should return summary");
    });

    describe("Summarize hours worked on projects", () => {
      it.todo("should return summary");
    });

    describe("Summarize hours worked on tasks", () => {
      it.todo("should return summary");
    });

    describe("Summarize hours worked in a period", () => {
      it.todo("should return summary for all the time");

      it.todo("should return summary for a custom period");

      // TODO this is not spec, it is design
      it.todo("should return summary for a week");
      it.todo("should return summary for a month");
      it.todo("should return summary for a year");
    });

    describe("Summarize the total hours worked", () => {
      it.todo("should return summary");
    });
  });

  describe("Timesheet", () => {
    describe("Summarize hours worked on tasks", () => {
      it.todo("should return summary");
    });

    describe("Summarize hours worked in a period", () => {
      // TODO this is not spec, it is design
      it.todo("should return summary for a day");
      it.todo("should return summary for a week");
      it.todo("should return summary for a month");
    });

    describe("Summarize the total hours worked", () => {
      it.todo("should return summary");
    });

    describe("Compare with capacity", () => {
      it.todo("should compare hours worked with capacity for a day");
      it.todo("should compare hours worked with capacity for a week");
      it.todo("should compare hours worked with capacity for a month");
    });

    describe("Take holidays into account", () => {
      it.todo("should reduce capacity by number of holidays");
    });

    describe("Take vacation into account", () => {
      it.todo("should reduce capacity by number of vacation days");
    });
  });
});
