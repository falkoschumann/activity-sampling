// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";
import { startActivitySampling } from "./activity_sampling";

describe("Activity Sampling", () => {
  describe("Start Timer", () => {
    describe("Start the timer with the default interval when the application starts", () => {
      it.todo("should start timer at application start");
    });

    describe("Start the timer with a given interval", () => {
      it("should start timer", async () => {
        const { log } = await startActivitySampling();

        await log.startTimer({ interval: "PT15M" });

        log.assertTimerStarted({ interval: "PT15M" });
      });
    });
  });

  describe("Stop Timer", () => {
    describe("Stop the timer", () => {
      it("should stop timer", async () => {
        const { log } = await startActivitySampling({
          now: "2025-09-17T17:51:00Z",
        });
        await log.startTimer();

        await log.passTime({ duration: "PT8M" });
        await log.stopTimer();

        log.assertTimerStopped({ timestamp: "2025-09-17T17:59:00Z" });
      });
    });
  });

  describe("Current Interval", () => {
    describe("Notify the user when an interval is elapsed", () => {
      it("should notify user", async () => {
        const { log } = await startActivitySampling({
          now: "2025-08-29T08:19:00Z",
        });
        await log.startTimer({ interval: "PT20M" });
        await log.intervalElapsed();

        await log.queryCurrentInterval();

        log.assertCurrentInterval({
          timestamp: "2025-08-29T08:39:00Z",
          duration: "PT20M",
        });
      });
    });
  });

  describe("Log Activity", () => {
    describe("Log the activity with a client, a project, a task and optional notes", () => {
      it("should log without an optional notes", async () => {
        const { log } = await startActivitySampling({
          now: "2025-08-29T09:42:00Z",
        });

        await log.logActivity({ timestamp: "2025-08-29T08:47:00Z" });

        await log.assertActivityLogged({ timestamp: "2025-08-29T08:47:00Z" });
      });

      it("should log with an optional notes", async () => {
        const { log } = await startActivitySampling({
          now: "2025-08-29T09:42:00Z",
        });

        await log.logActivity({
          timestamp: "2025-08-29T08:47:00Z",
          notes: "Test notes",
        });

        await log.assertActivityLogged({
          timestamp: "2025-08-29T08:47:00Z",
          notes: "Test notes",
        });
      });
    });
  });

  describe("Recent Activities", () => {
    describe("Group activities by working days for the last 30 days", () => {
      it("should return grouped activities", async () => {
        const { log } = await startActivitySampling({
          now: "2025-08-29T09:42:00Z",
        });
        await log.activityLogged({ timestamp: "2025-07-29T11:37:00Z" });
        await log.activityLogged({ timestamp: "2025-07-30T11:37:00Z" });
        await log.activityLogged({ timestamp: "2025-08-29T09:17:00Z" });
        await log.activityLogged({ timestamp: "2025-08-29T08:47:00Z" });

        await log.queryRecentActivities();

        log.assertRecentActivities({
          workingDays: [
            {
              date: "2025-08-29",
              activities: [
                { dateTime: "2025-08-29T11:17" },
                { dateTime: "2025-08-29T10:47" },
              ],
            },
            {
              date: "2025-07-30",
              activities: [{ dateTime: "2025-07-30T13:37" }],
            },
            // event from 2025-07-29 is not included because it's older than 30 days
          ],
        });
      });
    });

    describe("Summarize hours worked today, yesterday, this week and this month", () => {
      it("should return summary", async () => {
        const { log } = await startActivitySampling({
          now: "2025-08-29T09:42:00Z",
        });
        await log.activityLogged({ timestamp: "2025-08-29T08:47:00Z" });
        await log.activityLogged({ timestamp: "2025-08-29T09:17:00Z" });

        await log.queryRecentActivities();

        log.assertRecentActivities({
          timeSummary: {
            hoursToday: "PT1H",
            hoursYesterday: "PT0S",
            hoursThisWeek: "PT1H",
            hoursThisMonth: "PT1H",
          },
        });
      });
    });
  });

  describe("Reports", () => {
    describe("Summarize hours worked for clients", () => {
      it("should return summary", async () => {
        const { reports } = await startActivitySampling();
        await reports.activityLogged({
          timestamp: "2025-08-29T08:47:00Z",
          client: "Client A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:17:00Z",
          client: "Client A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:47:00Z",
          client: "Client B",
        });

        await reports.queryReport({ scope: "Clients" });

        reports.assertReport({
          entries: [
            { name: "Client A", hours: "PT1H" },
            { name: "Client B", hours: "PT30M" },
          ],
        });
      });
    });

    describe("Summarize hours worked on projects", () => {
      it("should return summary", async () => {
        const { reports } = await startActivitySampling();
        await reports.activityLogged({
          timestamp: "2025-08-29T08:47:00Z",
          client: "Client A",
          project: "Project A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:17:00Z",
          client: "Client A",
          project: "Project A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:47:00Z",
          client: "Client B",
          project: "Project B",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T10:17:00Z",
          client: "Client A",
          project: "Project C",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T10:47:00Z",
          client: "Client B",
          project: "Project C",
        });

        await reports.queryReport({ scope: "Projects" });

        reports.assertReport({
          entries: [
            { name: "Project A", client: "Client A", hours: "PT1H" },
            { name: "Project B", client: "Client B", hours: "PT30M" },
            { name: "Project C", client: "Client A, Client B", hours: "PT1H" },
          ],
        });
      });
    });

    describe("Summarize hours worked on tasks", () => {
      it("should return summary", async () => {
        const { reports } = await startActivitySampling();
        await reports.activityLogged({
          timestamp: "2025-08-29T08:47:00Z",
          task: "Task A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:17:00Z",
          task: "Task A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:47:00Z",
          task: "Task B",
        });

        await reports.queryReport({ scope: "Tasks" });

        reports.assertReport({
          entries: [
            { name: "Task A", hours: "PT1H" },
            { name: "Task B", hours: "PT30M" },
          ],
        });
      });
    });

    describe("Summarize the total hours worked", () => {
      it("should return summary", async () => {
        const { reports } = await startActivitySampling();
        await reports.activityLogged({
          timestamp: "2025-08-29T08:47:00Z",
          task: "Task A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:17:00Z",
          task: "Task A",
        });
        await reports.activityLogged({
          timestamp: "2025-08-29T09:47:00Z",
          task: "Task B",
        });

        await reports.queryReport({ scope: "Tasks" });

        reports.assertReport({ totalHours: "PT1H30M" });
      });
    });

    describe("Summarize in a period", () => {
      it("should return summary for all the time", async () => {
        const { reports } = await startActivitySampling({
          now: "2025-09-21T10:00:00Z",
        });
        await reports.activityLogged({ timestamp: "2025-01-21T09:00:00Z" });
        await reports.activityLogged({ timestamp: "2025-09-21T09:00:00Z" });

        await reports.queryReport({ scope: "Tasks" });

        reports.assertReport({ totalHours: "PT1H" });
      });

      it("should return summary for a custom period", async () => {
        const { reports } = await startActivitySampling();
        // event before the period
        await reports.activityLogged({ timestamp: "2025-09-07T09:00:00Z" });
        // events within the period
        await reports.activityLogged({ timestamp: "2025-09-08T09:00:00Z" });
        await reports.activityLogged({ timestamp: "2025-09-12T09:00:00Z" });
        await reports.activityLogged({ timestamp: "2025-09-14T09:00:00Z" });
        // event after the period
        await reports.activityLogged({ timestamp: "2025-09-15T09:00:00Z" });

        await reports.queryReport({
          scope: "Tasks",
          from: "2025-09-08",
          to: "2025-09-14",
        });

        reports.assertReport({ totalHours: "PT1H30M" });
      });
    });
  });

  describe("Timesheet", () => {
    describe("Summarize hours worked on tasks", () => {
      it("should return summary", async () => {
        const { timesheet } = await startActivitySampling();
        await timesheet.activityLogged({
          timestamp: "2025-09-21T08:00:00Z",
          client: "Client A",
          project: "Project A",
          task: "Task A",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-21T08:30:00Z",
          client: "Client A",
          project: "Project A",
          task: "Task A",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-21T09:00:00Z",
          client: "Client B",
          project: "Project B",
          task: "Task B",
        });

        await timesheet.queryTimesheet({
          from: "2025-09-21",
          to: "2025-09-21",
        });

        timesheet.assertTimesheet({
          entries: [
            {
              date: "2025-09-21",
              client: "Client A",
              project: "Project A",
              task: "Task A",
              hours: "PT1H",
            },
            {
              date: "2025-09-21",
              client: "Client B",
              project: "Project B",
              task: "Task B",
              hours: "PT30M",
            },
          ],
        });
      });
    });

    describe("Summarize the total hours worked", () => {
      it("should return summary", async () => {
        const { timesheet } = await startActivitySampling();
        await timesheet.activityLogged({
          timestamp: "2025-09-21T08:00:00Z",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-21T08:30:00Z",
        });

        await timesheet.queryTimesheet({
          from: "2025-09-21",
          to: "2025-09-21",
        });

        timesheet.assertTimesheet({ totalHours: "PT1H" });
      });
    });

    describe("Summarize in a period", () => {
      it("should return summary for a custom period", async () => {
        const { timesheet } = await startActivitySampling();
        await timesheet.activityLogged({ timestamp: "2025-09-07T09:00:00Z" });
        await timesheet.activityLogged({ timestamp: "2025-09-08T09:00:00Z" });
        await timesheet.activityLogged({ timestamp: "2025-09-12T09:00:00Z" });
        await timesheet.activityLogged({ timestamp: "2025-09-14T09:00:00Z" });
        await timesheet.activityLogged({ timestamp: "2025-09-15T09:00:00Z" });

        await timesheet.queryTimesheet({
          from: "2025-09-08",
          to: "2025-09-14",
        });

        timesheet.assertTimesheet({ totalHours: "PT1H30M" });
      });
    });

    describe("Compare with capacity", () => {
      it("should compare hours worked with capacity for a day", async () => {
        const { timesheet } = await startActivitySampling({
          now: "2025-09-21T13:00:00Z",
        });
        await timesheet.activityLogged({ timestamp: "2025-09-17T09:00:00Z" });
        await timesheet.activityLogged({ timestamp: "2025-09-18T09:00:00Z" });
        await timesheet.activityLogged({ timestamp: "2025-09-19T09:00:00Z" });

        await timesheet.queryTimesheet({
          from: "2025-09-18",
          to: "2025-09-18",
        });

        timesheet.assertTimesheet({
          capacity: { hours: "PT8H", offset: "-PT7H30M" },
        });
      });

      it("should compare hours worked with capacity for a week", async () => {
        const { timesheet } = await startActivitySampling({
          now: "2025-09-21T13:00:00Z",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-17T09:00:00Z",
          duration: "PT16H",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-18T09:00:00Z",
          duration: "PT16H",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-19T09:00:00Z",
          duration: "PT16H",
        });

        await timesheet.queryTimesheet({
          from: "2025-09-15",
          to: "2025-09-21",
        });

        timesheet.assertTimesheet({
          capacity: { hours: "PT40H", offset: "PT8H" },
        });
      });

      it("should compare hours worked with capacity for a month", async () => {
        const { timesheet } = await startActivitySampling({
          now: "2025-09-21T13:00:00Z",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-17T09:00:00Z",
          duration: "PT8H",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-18T09:00:00Z",
          duration: "PT8H",
        });
        await timesheet.activityLogged({
          timestamp: "2025-09-19T09:00:00Z",
          duration: "PT8H",
        });

        await timesheet.queryTimesheet({
          from: "2025-09-01",
          to: "2025-09-30",
        });

        timesheet.assertTimesheet({
          capacity: { hours: "PT176H", offset: "-PT96H" },
        });
      });
    });

    describe("Take holidays into account", () => {
      it("should reduce capacity by number of holidays", async () => {
        const { timesheet } = await startActivitySampling({
          now: "2025-04-23T15:00:00Z",
        });
        await timesheet.activityLogged({
          timestamp: "2025-04-22T15:00:00Z",
          duration: "PT8H",
        });
        await timesheet.activityLogged({
          timestamp: "2025-04-23T15:00:00Z",
          duration: "PT8H",
        });

        await timesheet.queryTimesheet({
          from: "2025-04-21",
          to: "2025-04-27",
        });

        timesheet.assertTimesheet({
          capacity: { hours: "PT32H", offset: "PT0S" },
        });
      });
    });

    describe("Take vacation into account", () => {
      it.todo("should reduce capacity by number of vacation days");
    });
  });
});
