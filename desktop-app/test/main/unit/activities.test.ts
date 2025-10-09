// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import {
  Activity,
  ActivityLoggedEvent,
  RecentActivitiesQueryResult,
  ReportEntry,
  Scope,
  TimesheetEntry,
  TimesheetQuery,
} from "../../../src/shared/domain/activities";
import {
  projectRecentActivities,
  projectReport,
  projectTimesheet,
} from "../../../src/main/domain/activities";
import { Holiday, Vacation } from "../../../src/main/domain/calendar";

describe("Activities", () => {
  describe("Project recent activities", () => {
    it("should return an empty result when no activity is logged", async () => {
      const events = createAsyncGenerator([]);

      const result = await projectRecentActivities(events, {});

      expect(result).toEqual(RecentActivitiesQueryResult.empty());
    });

    it("should return activities grouped by working day for the last 30 days", async () => {
      const events = createAsyncGenerator(
        mapTimestamps([
          "2025-05-05T14:00:00Z", // is not included
          "2025-05-06T14:00:00Z",
          "2025-06-04T14:00:00Z",
          "2025-06-05T08:30:00Z",
          "2025-06-05T09:00:00Z",
        ]),
      );

      const result = await projectRecentActivities(
        events,
        {},
        Clock.fixed("2025-06-05T10:00:00Z", "Europe/Berlin"),
      );

      expect(result.workingDays).toEqual([
        {
          date: Temporal.PlainDate.from("2025-06-05"),
          activities: [
            Activity.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-06-05T11:00"),
            }),
            Activity.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-06-05T10:30"),
            }),
          ],
        },
        {
          date: Temporal.PlainDate.from("2025-06-04"),
          activities: [
            Activity.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-06-04T16:00"),
            }),
          ],
        },
        {
          date: Temporal.PlainDate.from("2025-05-06"),
          activities: [
            Activity.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-05-06T16:00"),
            }),
          ],
        },
      ]);
    });

    it("should summarize hours worked today, yesterday, this week and this month", async () => {
      const events = createAsyncGenerator(
        mapTimestamps([
          // the end of last month
          "2025-05-31T14:00:00Z", // is not included
          // start of this month
          "2025-06-01T14:00:00Z",
          // end of last week
          "2025-06-01T10:00:00Z",
          // start of this week
          "2025-06-02T10:00:00Z",
          // the day before yesterday
          "2025-06-03T10:00:00Z",
          // yesterday
          "2025-06-04T10:00:00Z",
          "2025-06-04T10:30:00Z",
          "2025-06-04T11:00:00Z",
          // today
          "2025-06-05T09:00:00Z",
          "2025-06-05T09:30:00Z",
          // tomorrow
          "2025-06-06T08:30:00Z",
          // last day of this month
          "2025-06-30T08:30:00Z",
          // the first day of next month
          "2025-07-01T10:30:00Z", // is not included
        ]),
      );

      const result = await projectRecentActivities(
        events,
        {},
        Clock.fixed("2025-06-05T10:00:00Z", "Europe/Berlin"),
      );

      expect(result.timeSummary).toEqual({
        hoursToday: Temporal.Duration.from("PT1H"),
        hoursYesterday: Temporal.Duration.from("PT1H30M"),
        hoursThisWeek: Temporal.Duration.from("PT4H"),
        hoursThisMonth: Temporal.Duration.from("PT5H30M"),
      });
    });
  });

  describe("Project report", () => {
    it("should return an empty result when no activity is logged", async () => {
      const events = createAsyncGenerator([]);

      const result = await projectReport(events, { scope: Scope.TASKS });

      expect(result).toEqual({
        entries: [],
        totalHours: Temporal.Duration.from("PT0S"),
      });
    });

    it("should summarize hours worked on clients", async () => {
      const events = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-25T15:00:00Z",
          client: "Client 2",
          duration: "PT7H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-26T15:00:00Z",
          client: "Client 1",
          duration: "PT5H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-27T15:00:00Z",
          client: "Client 1",
          duration: "PT3H",
        }),
      ]);

      const result = await projectReport(events, { scope: Scope.CLIENTS });

      expect(result).toEqual({
        entries: [
          ReportEntry.createTestInstance({
            name: "Client 1",
            hours: Temporal.Duration.from("PT8H"),
          }),
          ReportEntry.createTestInstance({
            name: "Client 2",
            hours: Temporal.Duration.from("PT7H"),
          }),
        ],
        totalHours: Temporal.Duration.from("PT15H"),
      });
    });

    it("should summarize hours worked on projects", async () => {
      const events = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-02T15:00:00Z",
          client: "Client 2",
          project: "Project B",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-03T15:00:00Z",
          client: "Client 1",
          project: "Project A",
          duration: "PT9H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-04T15:00:00Z",
          client: "Client 2",
          project: "Project B",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-05T15:00:00Z",
          client: "Client 1",
          project: "Project A",
          duration: "PT9H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-06T15:00:00Z",
          client: "Client 2",
          project: "Project B",
          duration: "PT8H",
        }),
      ]);

      const result = await projectReport(events, { scope: Scope.PROJECTS });

      expect(result).toEqual({
        entries: [
          ReportEntry.createTestInstance({
            name: "Project A",
            client: "Client 1",
            hours: Temporal.Duration.from("PT18H"),
          }),
          ReportEntry.createTestInstance({
            name: "Project B",
            client: "Client 2",
            hours: Temporal.Duration.from("PT24H"),
          }),
        ],
        totalHours: Temporal.Duration.from("PT42H"),
      });
    });

    it("should summarize hours worked on projects and combines projects with multiple clients", async () => {
      const events = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-02T15:00:00Z",
          client: "Client 2",
          project: "Project A",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-03T15:00:00Z",
          client: "Client 1",
          project: "Project A",
          duration: "PT9H",
        }),
      ]);

      const result = await projectReport(events, { scope: Scope.PROJECTS });

      expect(result).toEqual({
        entries: [
          ReportEntry.createTestInstance({
            name: "Project A",
            client: "Client 2, Client 1",
            hours: Temporal.Duration.from("PT17H"),
          }),
        ],
        totalHours: Temporal.Duration.from("PT17H"),
      });
    });

    it("should summarize hours worked on tasks", async () => {
      const events = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-25T15:00:00Z",
          task: "Task 2",
          duration: "PT7H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-26T15:00:00Z",
          task: "Task 1",
          duration: "PT5H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-27T15:00:00Z",
          task: "Task 1",
          duration: "PT3H",
        }),
      ]);

      const result = await projectReport(events, { scope: Scope.TASKS });

      expect(result).toEqual({
        entries: [
          ReportEntry.createTestInstance({
            name: "Task 1",
            hours: Temporal.Duration.from("PT8H"),
          }),
          ReportEntry.createTestInstance({
            name: "Task 2",
            hours: Temporal.Duration.from("PT7H"),
          }),
        ],
        totalHours: Temporal.Duration.from("PT15H"),
      });
    });

    it("Summarize hours worked in a custom period", async () => {
      const events = createAsyncGenerator(
        mapTimestamps([
          "2025-09-14T15:00:00Z", // before
          "2025-09-15T15:00:00Z", // start
          "2025-09-17T15:00:00Z", // middle
          "2025-09-21T15:00:00Z", // end
          "2025-09-22T15:00:00Z", // after
        ]),
      );

      const result = await projectReport(events, {
        scope: Scope.TASKS,
        from: Temporal.PlainDate.from("2025-09-15"),
        to: Temporal.PlainDate.from("2025-09-21"),
      });

      expect(result.totalHours).toEqual(Temporal.Duration.from("PT1H30M"));
    });
  });

  describe("Project timesheet", () => {
    it("should return an empty result when no activities are logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-09-15", to: "2025-09-21" }),
      });

      expect(result).toEqual({
        entries: [],
        totalHours: Temporal.Duration.from("PT0S"),
        capacity: {
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("-PT40H"),
        },
      });
    });

    it("should summarize hours worked", async () => {
      const replay = createAsyncGenerator([
        // monday, only same tasks
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-02T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-02T10:30:00Z",
        }),
        // tuesday, different tasks
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-03T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-03T10:30:00Z",
          task: "Other task",
        }),
        // wednesday, different projects
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-04T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-04T10:30:00Z",
          project: "Other project",
        }),
        // thursday, different clients
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-05T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-05T10:30:00Z",
          client: "Other client",
        }),
      ]);

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-06-02", to: "2025-06-08" }),
      });

      expect(result.entries).toEqual([
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-02"),
          hours: Temporal.Duration.from("PT1H"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-03"),
          task: "Other task",
          hours: Temporal.Duration.from("PT30M"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-03"),
          hours: Temporal.Duration.from("PT30M"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-04"),
          project: "Other project",
          hours: Temporal.Duration.from("PT30M"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-04"),
          hours: Temporal.Duration.from("PT30M"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-05"),
          client: "Other client",
          hours: Temporal.Duration.from("PT30M"),
        }),
        TimesheetEntry.createTestInstance({
          date: Temporal.PlainDate.from("2025-06-05"),
          hours: Temporal.Duration.from("PT30M"),
        }),
      ]);
    });

    it("should summarize the total hours worked", async () => {
      const replay = createAsyncGenerator(
        mapTimestamps([
          "2025-06-02T10:00:00Z",
          "2025-06-02T10:30:00Z",
          "2025-06-02T11:00:00Z",
        ]),
      );

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-06-02", to: "2025-06-08" }),
      });

      expect(result.totalHours).toEqual(Temporal.Duration.from("PT1H30M"));
    });

    describe("Compare with capacity", () => {
      it("should compare with capacity", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          capacity: Temporal.Duration.from("PT40H"),
          clock: Clock.fixed("2025-06-11T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("PT0H"),
        });
      });

      it("should return the offset 0 when capacity is reached", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT8H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          capacity: Temporal.Duration.from("PT40H"),
          clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("PT0S"),
        });
      });

      it("should return a negative offset when hours is behind of the capacity", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT6H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT6H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT6H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          capacity: Temporal.Duration.from("PT40H"),
          clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("-PT6H"),
        });
      });

      it("should return a positive offset when hours is ahead of the capacity", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-09T14:00:00Z",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-10T14:00:00Z",
            duration: "PT10H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-11T14:00:00Z",
            duration: "PT10H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-12T14:00:00Z",
            duration: "PT10H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          capacity: Temporal.Duration.from("PT40H"),
          clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("PT6H"),
        });
      });
    });

    it("should take holidays into account", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-10T14:00:00Z",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-11T14:00:00Z",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-06-12T14:00:00Z",
          duration: "PT8H",
        }),
      ]);

      const result = await projectTimesheet({
        replay,
        holidays: [
          Holiday.create({ date: "2025-06-09", title: "Pfingstmontag" }),
        ],
        query: TimesheetQuery.create({ from: "2025-06-09", to: "2025-06-15" }),
        capacity: Temporal.Duration.from("PT40H"),
        clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
      });

      expect(result.capacity).toEqual({
        hours: Temporal.Duration.from("PT32H"),
        offset: Temporal.Duration.from("PT0S"),
      });
    });

    it("should take vacation into account", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-09-08T14:00:00Z",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-09-09T14:00:00Z",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-09-11T14:00:00Z",
          duration: "PT8H",
        }),
      ]);

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-09-08", to: "2025-09-14" }),
        vacations: [Vacation.create({ date: "2025-09-10" })],
        capacity: Temporal.Duration.from("PT40H"),
        clock: Clock.fixed("2025-09-11T16:00:00Z", "Europe/Berlin"),
      });

      expect(result.capacity).toEqual({
        hours: Temporal.Duration.from("PT32H"),
        offset: Temporal.Duration.from("PT0S"),
      });
    });
  });
});

function mapTimestamps(timestamps: string[]) {
  return timestamps.map((timestamp) =>
    ActivityLoggedEvent.createTestInstance({ timestamp }),
  );
}

async function* createAsyncGenerator(events: ActivityLoggedEvent[]) {
  for (const event of events) {
    yield event;
  }
}
