// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import {
  Activity,
  ActivityLoggedEvent,
  ActivityNew,
  Capacity,
  RecentActivitiesQueryResult,
  ReportEntry,
  ReportQueryResult,
  Scope,
  Statistics,
  StatisticsQueryResult,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
  TimeSummary,
  WorkingDay,
} from "../../../src/shared/domain/activities";
import {
  projectActivities,
  projectRecentActivities,
  projectReport,
  projectStatistics,
  projectTimesheet,
} from "../../../src/main/domain/activities";
import { Holiday, Vacation } from "../../../src/main/domain/calendar";

describe("Activities", () => {
  describe("Project activities", () => {
    it("should return no activities when no events are logged", async () => {
      const replay = createAsyncGenerator([]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<ActivityNew[]>([]);
    });

    it("should map an event to an activity", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance(),
      ]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<ActivityNew[]>([
        ActivityNew.createTestInstance(),
      ]);
    });

    it("should aggregate events to activities for the same task", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-13T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-12T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-14T10:00:00Z",
        }),
      ]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<ActivityNew[]>([
        ActivityNew.createTestInstance({
          start: "2025-11-12",
          finish: "2025-11-14",
          hours: "PT1H30M",
        }),
      ]);
    });

    it("should aggregate events to activities for different tasks", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-13T10:00:00Z",
          task: "Task A",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-14T10:00:00Z",
          task: "Task B",
        }),
      ]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<ActivityNew[]>([
        ActivityNew.createTestInstance({
          start: "2025-11-13",
          finish: "2025-11-13",
          task: "Task A",
          hours: "PT30M",
        }),
        ActivityNew.createTestInstance({
          start: "2025-11-14",
          finish: "2025-11-14",
          task: "Task B",
          hours: "PT30M",
        }),
      ]);
    });

    it("should filter by date range", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-10T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-11T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-12T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-13T10:00:00Z",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-14T10:00:00Z",
        }),
      ]);

      const activities = await projectActivities(
        replay,
        undefined,
        "2025-11-11",
        "2025-11-14",
      );

      expect(activities).toEqual<ActivityNew[]>([
        ActivityNew.createTestInstance({
          start: "2025-11-11",
          finish: "2025-11-13",
          hours: "PT1H30M",
        }),
      ]);
    });
  });

  describe("Project recent activities", () => {
    it("should return an empty result when no activity is logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectRecentActivities({ replay, query: {} });

      expect(result).toEqual<RecentActivitiesQueryResult>(
        RecentActivitiesQueryResult.empty(),
      );
    });

    it("should return activities grouped by working day for the last 30 days", async () => {
      const replay = createAsyncGenerator(
        mapTimestamps([
          "2025-05-05T14:00:00Z", // is not included
          "2025-05-06T14:00:00Z",
          "2025-06-04T14:00:00Z",
          "2025-06-05T08:30:00Z",
          "2025-06-05T09:00:00Z",
        ]),
      );

      const result = await projectRecentActivities({
        replay,
        query: {},
        clock: Clock.fixed("2025-06-05T10:00:00Z", "Europe/Berlin"),
      });

      expect(result.workingDays).toEqual<WorkingDay[]>([
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
      const replay = createAsyncGenerator(
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

      const result = await projectRecentActivities({
        replay,
        query: {},
        clock: Clock.fixed("2025-06-05T10:00:00Z", "Europe/Berlin"),
      });

      expect(result.timeSummary).toEqual<TimeSummary>({
        hoursToday: Temporal.Duration.from("PT1H"),
        hoursYesterday: Temporal.Duration.from("PT1H30M"),
        hoursThisWeek: Temporal.Duration.from("PT4H"),
        hoursThisMonth: Temporal.Duration.from("PT5H30M"),
      });
    });
  });

  describe("Project report", () => {
    it("should return an empty result when no activity is logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectReport({
        replay,
        query: { scope: Scope.TASKS },
      });

      expect(result).toEqual<ReportQueryResult>({
        entries: [],
        totalHours: Temporal.Duration.from("PT0S"),
      });
    });

    it("should summarize hours worked on clients", async () => {
      const replay = createAsyncGenerator([
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

      const result = await projectReport({
        replay,
        query: { scope: Scope.CLIENTS },
      });

      expect(result).toEqual<ReportQueryResult>({
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
      const replay = createAsyncGenerator([
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

      const result = await projectReport({
        replay,
        query: { scope: Scope.PROJECTS },
      });

      expect(result).toEqual<ReportQueryResult>({
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
      const replay = createAsyncGenerator([
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

      const result = await projectReport({
        replay,
        query: { scope: Scope.PROJECTS },
      });

      expect(result).toEqual<ReportQueryResult>({
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
      const replay = createAsyncGenerator([
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

      const result = await projectReport({
        replay,
        query: { scope: Scope.TASKS },
      });

      expect(result).toEqual<ReportQueryResult>({
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
      const replay = createAsyncGenerator(
        mapTimestamps([
          "2025-09-14T15:00:00Z", // before
          "2025-09-15T15:00:00Z", // start
          "2025-09-17T15:00:00Z", // middle
          "2025-09-21T15:00:00Z", // end
          "2025-09-22T15:00:00Z", // after
        ]),
      );

      const result = await projectReport({
        replay,
        query: {
          scope: Scope.TASKS,
          from: Temporal.PlainDate.from("2025-09-15"),
          to: Temporal.PlainDate.from("2025-09-21"),
        },
      });

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT1H30M"),
      );
    });
  });

  describe("Project statistics", () => {
    describe("Working hours", () => {
      it("should return empty histogram when no activities are logged", async () => {
        const replay = createAsyncGenerator([]);

        const result = await projectStatistics({
          replay,
          query: {
            statistics: Statistics.WORKING_HOURS,
          },
        });

        expect(result).toEqual<StatisticsQueryResult>({
          histogram: {
            binEdges: [],
            frequencies: [],
            xAxisLabel: "Duration (days)",
            yAxisLabel: "Number of Tasks",
          },
          median: {
            edge0: 0,
            edge25: 0,
            edge50: 0,
            edge75: 0,
            edge100: 0,
          },
        });
      });

      it("should determine frequencies per bin with 3 tasks", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            task: "Task A",
            duration: "PT24H", // 3 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task B",
            duration: "PT40H", // 5 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task C",
            duration: "PT16H", // 2 person days
          }),
        ]);

        const result = await projectStatistics({
          replay,
          query: { statistics: Statistics.WORKING_HOURS },
        });

        expect(result).toEqual<StatisticsQueryResult>({
          histogram: {
            binEdges: ["0", "0.5", "1", "2", "3", "5"],
            frequencies: [0, 0, 1, 1, 1],
            xAxisLabel: "Duration (days)",
            yAxisLabel: "Number of Tasks",
          },
          median: {
            edge0: 0,
            edge25: 2,
            edge50: 3,
            edge75: 4,
            edge100: 5,
          },
        });
      });

      it("should determine frequencies per bin with even number of tasks", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            task: "Task A",
            duration: "PT24H", // 3 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task B",
            duration: "PT40H", // 5 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task C",
            duration: "PT32H", // 4 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task D",
            duration: "PT4H", // 0.5 person days
          }),
        ]);

        const result = await projectStatistics({
          replay,
          query: { statistics: Statistics.WORKING_HOURS },
        });

        expect(result).toEqual<StatisticsQueryResult>({
          histogram: {
            binEdges: ["0", "0.5", "1", "2", "3", "5"],
            frequencies: [1, 0, 0, 1, 2],
            xAxisLabel: "Duration (days)",
            yAxisLabel: "Number of Tasks",
          },
          median: {
            edge0: 0,
            edge25: 0.5,
            edge50: 3.5,
            edge75: 4,
            edge100: 5,
          },
        });
      });

      it("should determine frequencies per bin with odd number of tasks", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            task: "Task A",
            duration: "PT24H", // 3 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task B",
            duration: "PT40H", // 5 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task C",
            duration: "PT32H", // 4 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task D",
            duration: "PT8H", // 1 person days
          }),
          ActivityLoggedEvent.createTestInstance({
            task: "Task E",
            duration: "PT16H", // 2 person days
          }),
        ]);

        const result = await projectStatistics({
          replay,
          query: { statistics: Statistics.WORKING_HOURS },
        });

        expect(result).toEqual<StatisticsQueryResult>({
          histogram: {
            binEdges: ["0", "0.5", "1", "2", "3", "5"],
            frequencies: [0, 1, 1, 1, 2],
            xAxisLabel: "Duration (days)",
            yAxisLabel: "Number of Tasks",
          },
          median: {
            edge0: 0,
            edge25: 1.5,
            edge50: 3,
            edge75: 3.5,
            edge100: 5,
          },
        });
      });
    });

    describe("Cycle times", () => {
      it("should return statistics for cycle time", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-08-13T12:00:00Z",
            task: "Task A",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-08-13T12:00:00Z",
            task: "Task B",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-08-15T12:00:00Z",
            task: "Task C",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-08-16T12:00:00Z",
            task: "Task A",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-08-18T12:00:00Z",
            task: "Task B",
          }),
        ]);

        const result = await projectStatistics({
          replay,
          query: { statistics: Statistics.CYCLE_TIMES },
        });

        expect(result).toEqual<StatisticsQueryResult>({
          histogram: {
            binEdges: ["0", "1", "2", "3", "5", "8"],
            frequencies: [1, 0, 0, 1, 1],
            xAxisLabel: "Cycle time (days)",
            yAxisLabel: "Number of Tasks",
          },
          median: {
            edge0: 0,
            edge25: 1,
            edge50: 4,
            edge75: 5,
            edge100: 6,
          },
        });
      });
    });
  });

  describe("Project timesheet", () => {
    it("should return an empty result when no activities are logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-09-15", to: "2025-09-21" }),
      });

      expect(result).toEqual<TimesheetQueryResult>({
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

      expect(result.entries).toEqual<TimesheetEntry[]>([
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

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT1H30M"),
      );
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
          clock: Clock.fixed("2025-06-11T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual<Capacity>({
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
          clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual<Capacity>({
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
          clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual<Capacity>({
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
          clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
        });

        expect(result.capacity).toEqual<Capacity>({
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
        clock: Clock.fixed("2025-06-12T16:00:00Z", "Europe/Berlin"),
      });

      expect(result.capacity).toEqual<Capacity>({
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
        clock: Clock.fixed("2025-09-11T16:00:00Z", "Europe/Berlin"),
      });

      expect(result.capacity).toEqual<Capacity>({
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
