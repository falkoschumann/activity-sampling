// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";
import {
  ActivityLoggedEvent,
  Capacity,
  EstimateQueryResult,
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
  Activity,
  projectActivities,
  projectEstimate,
  projectRecentActivities,
  projectReport,
  projectStatistics,
  projectTimesheet,
} from "../../../src/main/domain/activities";
import { Holiday, Vacation } from "../../../src/main/domain/calendar";

describe("Activities", () => {
  describe("Project activities", () => {
    it("should return an empty result when no activity are logged", async () => {
      const replay = createAsyncGenerator([]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<Activity[]>([]);
    });

    it("should map an event to an activity", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance(),
      ]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<Activity[]>([Activity.createTestInstance()]);
    });

    it("should aggregate events to activities for the same task", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-13T11:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-12T11:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-14T11:00",
        }),
      ]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<Activity[]>([
        Activity.createTestInstance({
          start: "2025-11-12",
          finish: "2025-11-14",
          hours: "PT1H30M",
        }),
      ]);
    });

    it("should aggregate events to activities for different tasks", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-13T11:00",
          task: "Task A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-14T11:00",
          task: "Task B",
        }),
      ]);

      const activities = await projectActivities(replay);

      expect(activities).toEqual<Activity[]>([
        Activity.createTestInstance({
          start: "2025-11-13",
          finish: "2025-11-13",
          task: "Task A",
          hours: "PT30M",
        }),
        Activity.createTestInstance({
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
          dateTime: "2025-11-10T11:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-11T11:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-12T11:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-13T11:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-14T11:00",
        }),
      ]);

      const activities = await projectActivities(
        replay,
        "2025-11-11",
        "2025-11-14",
      );

      expect(activities).toEqual<Activity[]>([
        Activity.createTestInstance({
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

      const result = await projectRecentActivities({
        replay,
        today: Temporal.PlainDate.from("2025-11-19"),
      });

      expect(result).toEqual<RecentActivitiesQueryResult>(
        RecentActivitiesQueryResult.empty(),
      );
    });

    it("should return activities grouped by working day for the last 30 days", async () => {
      const replay = createAsyncGenerator(
        mapTimestamps([
          "2025-05-05T16:00", // is not included
          "2025-05-06T16:00",
          "2025-06-04T16:00",
          "2025-06-05T10:30",
          "2025-06-05T11:00",
        ]),
      );

      const result = await projectRecentActivities({
        replay,
        today: Temporal.PlainDate.from("2025-06-05"),
      });

      expect(result.workingDays).toEqual<WorkingDay[]>([
        {
          date: Temporal.PlainDate.from("2025-06-05"),
          activities: [
            ActivityLoggedEvent.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-06-05T11:00"),
            }),
            ActivityLoggedEvent.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-06-05T10:30"),
            }),
          ],
        },
        {
          date: Temporal.PlainDate.from("2025-06-04"),
          activities: [
            ActivityLoggedEvent.createTestInstance({
              dateTime: Temporal.PlainDateTime.from("2025-06-04T16:00"),
            }),
          ],
        },
        {
          date: Temporal.PlainDate.from("2025-05-06"),
          activities: [
            ActivityLoggedEvent.createTestInstance({
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
          "2025-05-31T16:00", // is not included
          // start of this month
          "2025-06-01T16:00",
          // end of last week
          "2025-06-01T12:00",
          // start of this week
          "2025-06-02T12:00",
          // the day before yesterday
          "2025-06-03T12:00",
          // yesterday
          "2025-06-04T12:00",
          "2025-06-04T12:30",
          "2025-06-04T13:00",
          // today
          "2025-06-05T11:00",
          "2025-06-05T11:30",
          // tomorrow
          "2025-06-06T10:30",
          // last day of this month
          "2025-06-30T10:30",
          // the first day of next month
          "2025-07-01T12:30", // is not included
        ]),
      );

      const result = await projectRecentActivities({
        replay,
        today: Temporal.PlainDate.from("2025-06-05"),
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
        query: { scope: Scope.CLIENTS },
      });

      expect(result).toEqual<ReportQueryResult>({
        entries: [],
        totalHours: Temporal.Duration.from("PT0S"),
      });
    });

    it("should summarize hours worked on clients", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-25T17:00",
          client: "Client 2",
          duration: "PT7H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-26T17:00",
          client: "Client 1",
          task: "Task 1",
          duration: "PT5H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-27T17:00",
          client: "Client 1",
          task: "Task 2",
          duration: "PT3H",
        }),
      ]);

      const result = await projectReport({
        replay,
        query: { scope: Scope.CLIENTS },
      });

      expect(result).toEqual<ReportQueryResult>({
        entries: [
          ReportEntry.create({
            start: "2025-06-26",
            finish: "2025-06-27",
            client: "Client 1",
            hours: Temporal.Duration.from("PT8H"),
            cycleTime: 2,
          }),
          ReportEntry.create({
            start: "2025-06-25",
            finish: "2025-06-25",
            client: "Client 2",
            hours: Temporal.Duration.from("PT7H"),
            cycleTime: 1,
          }),
        ],
        totalHours: Temporal.Duration.from("PT15H"),
      });
    });

    it("should summarize hours worked on projects", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-02T17:00",
          client: "Client 2",
          project: "Project 2",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-03T17:00",
          client: "Client 1",
          project: "Project 1",
          duration: "PT9H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-04T17:00",
          client: "Client 2",
          project: "Project 2",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-05T17:00",
          client: "Client 1",
          project: "Project 1",
          duration: "PT9H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-06T17:00",
          client: "Client 1",
          project: "Project 2",
          duration: "PT8H",
        }),
      ]);

      const result = await projectReport({
        replay,
        query: { scope: Scope.PROJECTS },
      });

      expect(result).toEqual<ReportQueryResult>({
        entries: [
          ReportEntry.create({
            start: "2025-06-03",
            finish: "2025-06-05",
            project: "Project 1",
            client: "Client 1",
            hours: Temporal.Duration.from("PT18H"),
            cycleTime: 3,
          }),
          ReportEntry.create({
            start: "2025-06-02",
            finish: "2025-06-06",
            project: "Project 2",
            client: "Client 1, Client 2",
            hours: Temporal.Duration.from("PT24H"),
            cycleTime: 5,
          }),
        ],
        totalHours: Temporal.Duration.from("PT42H"),
      });
    });

    it("should summarize hours worked on tasks", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-25T17:00",
          task: "Task 2",
          duration: "PT7H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-26T17:00",
          task: "Task 1",
          category: "Feature",
          duration: "PT5H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-27T17:00",
          task: "Task 1",
          category: "Rework",
          duration: "PT3H",
        }),
      ]);

      const result = await projectReport({
        replay,
        query: { scope: Scope.TASKS },
      });

      expect(result).toEqual<ReportQueryResult>({
        entries: [
          ReportEntry.create({
            start: "2025-06-26",
            finish: "2025-06-27",
            client: "Test client",
            project: "Test project",
            task: "Task 1",
            category: "Feature, Rework",
            hours: Temporal.Duration.from("PT8H"),
            cycleTime: 2,
          }),
          ReportEntry.create({
            start: "2025-06-25",
            finish: "2025-06-25",
            client: "Test client",
            project: "Test project",
            task: "Task 2",
            hours: Temporal.Duration.from("PT7H"),
            cycleTime: 1,
          }),
        ],
        totalHours: Temporal.Duration.from("PT15H"),
      });
    });

    it("should summarize hours worked on categories", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-25T17:00",
          category: "Rework",
          duration: "PT7H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-26T17:00",
          category: "Feature",
          duration: "PT5H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-27T17:00",
          category: "Feature",
          duration: "PT3H",
        }),
      ]);

      const result = await projectReport({
        replay,
        query: { scope: Scope.CATEGORIES },
      });

      expect(result).toEqual<ReportQueryResult>({
        entries: [
          ReportEntry.create({
            start: "2025-06-26",
            finish: "2025-06-27",
            category: "Feature",
            hours: Temporal.Duration.from("PT8H"),
            cycleTime: 2,
          }),
          ReportEntry.create({
            start: "2025-06-25",
            finish: "2025-06-25",
            category: "Rework",
            hours: Temporal.Duration.from("PT7H"),
            cycleTime: 1,
          }),
        ],
        totalHours: Temporal.Duration.from("PT15H"),
      });
    });

    it("should summarize hours worked in a custom period", async () => {
      const replay = createAsyncGenerator(
        mapTimestamps([
          "2025-09-14T17:00", // before
          "2025-09-15T17:00", // start
          "2025-09-17T17:00", // middle
          "2025-09-21T17:00", // end
          "2025-09-22T17:00", // after
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
      it("should return an empty result when no activities are logged", async () => {
        const replay = createAsyncGenerator([]);

        const result = await projectStatistics({
          replay,
          query: { statistics: Statistics.CYCLE_TIMES },
        });

        expect(result).toEqual<StatisticsQueryResult>({
          histogram: {
            binEdges: [],
            frequencies: [],
            xAxisLabel: "Cycle time (days)",
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

      it("should return statistics for cycle time", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-08-13T14:00",
            task: "Task A",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-08-13T14:00",
            task: "Task B",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-08-15T14:00",
            task: "Task C",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-08-16T14:00",
            task: "Task A",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-08-18T14:00",
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
        today: Temporal.PlainDate.from("2025-11-19"),
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
          dateTime: "2025-06-02T12:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-02T12:30",
        }),
        // tuesday, different tasks
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-03T12:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-03T12:30",
          task: "Other task",
        }),
        // wednesday, different projects
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-04T12:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-04T12:30",
          project: "Other project",
        }),
        // thursday, different clients
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-05T12:00",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-05T12:30",
          client: "Other client",
        }),
      ]);

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-06-02", to: "2025-06-08" }),
        today: Temporal.PlainDate.from("2025-11-19"),
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
          "2025-06-02T12:00",
          "2025-06-02T12:30",
          "2025-06-02T13:00",
        ]),
      );

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-06-02", to: "2025-06-08" }),
        today: Temporal.PlainDate.from("2025-11-19"),
      });

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT1H30M"),
      );
    });

    describe("Compare with capacity", () => {
      it("should compare with capacity", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-09T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-10T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-11T16:00",
            duration: "PT8H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          today: Temporal.PlainDate.from("2025-06-11"),
        });

        expect(result.capacity).toEqual<Capacity>({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("PT0H"),
        });
      });

      it("should return the offset 0 when capacity is reached", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-09T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-10T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-11T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-12T16:00",
            duration: "PT8H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          today: Temporal.PlainDate.from("2025-06-12"),
        });

        expect(result.capacity).toEqual<Capacity>({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("PT0S"),
        });
      });

      it("should return a negative offset when hours is behind of the capacity", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-09T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-10T16:00",
            duration: "PT6H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-11T16:00",
            duration: "PT6H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-12T16:00",
            duration: "PT6H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          today: Temporal.PlainDate.from("2025-06-12"),
        });

        expect(result.capacity).toEqual<Capacity>({
          hours: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("-PT6H"),
        });
      });

      it("should return a positive offset when hours is ahead of the capacity", async () => {
        const replay = createAsyncGenerator([
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-09T16:00",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-10T16:00",
            duration: "PT10H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-11T16:00",
            duration: "PT10H",
          }),
          ActivityLoggedEvent.createTestInstance({
            dateTime: "2025-06-12T16:00",
            duration: "PT10H",
          }),
        ]);

        const result = await projectTimesheet({
          replay,
          query: TimesheetQuery.create({
            from: "2025-06-09",
            to: "2025-06-15",
          }),
          today: Temporal.PlainDate.from("2025-06-12"),
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
          dateTime: "2025-06-10T16:00",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-11T16:00",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-06-12T16:00",
          duration: "PT8H",
        }),
      ]);

      const result = await projectTimesheet({
        replay,
        holidays: [
          Holiday.create({ date: "2025-06-09", title: "Pfingstmontag" }),
        ],
        query: TimesheetQuery.create({ from: "2025-06-09", to: "2025-06-15" }),
        today: Temporal.PlainDate.from("2025-06-12"),
      });

      expect(result.capacity).toEqual<Capacity>({
        hours: Temporal.Duration.from("PT32H"),
        offset: Temporal.Duration.from("PT0S"),
      });
    });

    it("should take vacation into account", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-09-08T16:00",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-09-09T16:00",
          duration: "PT8H",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-09-11T16:00",
          duration: "PT8H",
        }),
      ]);

      const result = await projectTimesheet({
        replay,
        query: TimesheetQuery.create({ from: "2025-09-08", to: "2025-09-14" }),
        vacations: [Vacation.create({ date: "2025-09-10" })],
        today: Temporal.PlainDate.from("2025-09-11"),
      });

      expect(result.capacity).toEqual<Capacity>({
        hours: Temporal.Duration.from("PT32H"),
        offset: Temporal.Duration.from("PT0S"),
      });
    });
  });

  describe("Project estimate", () => {
    it("should return an empty result when no activities are logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectEstimate({ replay });

      expect(result).toEqual<EstimateQueryResult>({ cycleTimes: [] });
    });

    it("should calculate the probability of cycle times", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task B",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task C",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task D",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-04T10:00",
          task: "Task C",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-05T10:00",
          task: "Task D",
        }),
      ]);

      const result = await projectEstimate({ replay });

      expect(result).toEqual<EstimateQueryResult>({
        cycleTimes: [
          {
            cycleTime: 1,
            frequency: 2,
            probability: 0.5,
            cumulativeProbability: 0.5,
          },
          {
            cycleTime: 2,
            frequency: 1,
            probability: 0.25,
            cumulativeProbability: 0.75,
          },
          {
            cycleTime: 3,
            frequency: 1,
            probability: 0.25,
            cumulativeProbability: 1.0,
          },
        ],
      });
    });
  });
});

function mapTimestamps(dateTimes: string[]) {
  return dateTimes.map((dateTime) =>
    ActivityLoggedEvent.createTestInstance({ dateTime }),
  );
}

async function* createAsyncGenerator(events: ActivityLoggedEvent[]) {
  for (const event of events) {
    yield event;
  }
}
