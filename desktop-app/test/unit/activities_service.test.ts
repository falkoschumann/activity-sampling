// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../src/main/infrastructure/events";
import {
  createTestActivity,
  createTestLogActivityCommand,
  createTestReportEntry,
  createTestReportQuery,
  createTestTimesheetEntry,
  createTestTimesheetQuery,
  Scope,
} from "../../src/main/domain/activities";
import { createSuccess } from "../../src/main/common/messages";

describe("Activities service", () => {
  describe("Ask periodically", () => {
    it.todo("Start the countdown with a given interval");
    it.todo(
      "Start countdown with the default interval when the application starts",
    );
  });

  describe("Current Interval", () => {
    it.todo("Notify the user when an interval is elapsed");
  });

  describe("Log activity", () => {
    describe("Log the activity with a client, a project, a task and an optional notes", () => {
      it("Logs without an optional notes", async () => {
        const eventStore = EventStore.createNull();
        const service = ActivitiesService.createNull({ eventStore });
        const recordEvents = eventStore.trackRecorded();

        const status = await service.logActivity(
          createTestLogActivityCommand(),
        );

        expect(status).toEqual(createSuccess());
        expect(recordEvents.data).toEqual([
          ActivityLoggedEvent.createTestData(),
        ]);
      });

      it("Logs with an optional notes", async () => {
        const eventStore = EventStore.createNull();
        const service = ActivitiesService.createNull({ eventStore });
        const recordEvents = eventStore.trackRecorded();

        const status = await service.logActivity(
          createTestLogActivityCommand({ notes: "Lorem ipsum" }),
        );

        expect(status).toEqual(createSuccess());
        expect(recordEvents.data).toEqual([
          ActivityLoggedEvent.createTestData({ notes: "Lorem ipsum" }),
        ]);
      });

      it.todo("Select an activity from recent activities");
      it.todo("Select the last activity when the application starts");
    });
  });

  describe("Recent activities", () => {
    it("Return empty result when no activities are logged", async () => {
      const eventStore = EventStore.createNull({
        events: [[]],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryRecentActivities({});

      expect(result).toEqual({
        lastActivity: undefined,
        workingDays: [],
        timeSummary: {
          hoursToday: "PT0S",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT0S",
          hoursThisMonth: "PT0S",
        },
      });
    });

    it("Return last activity", async () => {
      const eventStore = EventStore.createNull({
        events: [[ActivityLoggedEvent.createTestData()]],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryRecentActivities({});

      expect(result.lastActivity).toEqual(createTestActivity());
    });

    it("Group activities by working days for the last 30 days", async () => {
      const timestamps = [
        "2025-05-05T14:00:00Z",
        "2025-05-06T14:00:00Z",
        "2025-06-04T14:00:00Z",
        "2025-06-05T08:30:00Z",
        "2025-06-05T09:00:00Z",
      ];
      const eventStore = EventStore.createNull({
        events: [
          timestamps.map((timestamp) =>
            ActivityLoggedEvent.createTestData({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-05T10:00:00Z",
      });

      const result = await service.queryRecentActivities({});

      expect(result.workingDays).toEqual([
        {
          date: "2025-06-05",
          activities: [
            createTestActivity({ dateTime: "2025-06-05T11:00" }),
            createTestActivity({ dateTime: "2025-06-05T10:30" }),
          ],
        },
        {
          date: "2025-06-04",
          activities: [createTestActivity({ dateTime: "2025-06-04T16:00" })],
        },
        {
          date: "2025-05-06",
          activities: [createTestActivity({ dateTime: "2025-05-06T16:00" })],
        },
      ]);
    });

    it("Summarize hours worked today, yesterday, this week and this month", async () => {
      const timestamps = [
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
        "2025-06-06T08:30:00Z", // is included in week and month
        // last day of this month
        "2025-06-30T08:30:00Z",
        // the first day of next month
        "2025-07-01T10:30:00Z", // is not included
      ];
      const eventStore = EventStore.createNull({
        events: [
          timestamps.map((timestamp) =>
            ActivityLoggedEvent.createTestData({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-05T10:00:00Z",
      });

      const result = await service.queryRecentActivities({});

      expect(result.timeSummary).toEqual({
        hoursToday: "PT1H",
        hoursYesterday: "PT1H30M",
        hoursThisWeek: "PT4H",
        hoursThisMonth: "PT5H30M",
      });
    });
  });

  describe("Reports", () => {
    it("Returns empty result when no activities are logged", async () => {
      const eventStore = EventStore.createNull({ events: [[]] });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        createTestReportQuery({
          scope: Scope.TASKS,
        }),
      );

      expect(result).toEqual({ entries: [], totalHours: "PT0S" });
    });

    it("Summarize hours worked for clients", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-25T15:00:00Z",
              client: "Client 2",
              duration: "PT7H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-26T15:00:00Z",
              client: "Client 1",
              duration: "PT5H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-27T15:00:00Z",
              client: "Client 1",
              duration: "PT3H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        createTestReportQuery({
          scope: Scope.CLIENTS,
        }),
      );

      expect(result.entries).toEqual([
        createTestReportEntry({ name: "Client 1", hours: "PT8H" }),
        createTestReportEntry({ name: "Client 2", hours: "PT7H" }),
      ]);
    });

    it("Summarize hours worked on projects", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-02T15:00:00Z",
              client: "Client 2",
              project: "Project B",
              duration: "PT8H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-03T15:00:00Z",
              client: "Client 1",
              project: "Project A",
              duration: "PT9H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-04T15:00:00Z",
              client: "Client 2",
              project: "Project B",
              duration: "PT8H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-05T15:00:00Z",
              client: "Client 1",
              project: "Project A",
              duration: "PT9H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-06T15:00:00Z",
              client: "Client 2",
              project: "Project B",
              duration: "PT8H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(createTestReportQuery({}));

      expect(result.entries).toEqual([
        createTestReportEntry({
          name: "Project A",
          client: "Client 1",
          hours: "PT18H",
        }),
        createTestReportEntry({
          name: "Project B",
          client: "Client 2",
          hours: "PT24H",
        }),
      ]);
    });

    it("Summarize hours worked on tasks", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-25T15:00:00Z",
              task: "Task 2",
              duration: "PT7H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-26T15:00:00Z",
              task: "Task 1",
              duration: "PT5H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-27T15:00:00Z",
              task: "Task 1",
              duration: "PT3H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        createTestReportQuery({
          scope: Scope.TASKS,
        }),
      );

      expect(result.entries).toEqual([
        createTestReportEntry({ name: "Task 1", hours: "PT8H" }),
        createTestReportEntry({ name: "Task 2", hours: "PT7H" }),
      ]);
    });

    it.todo("Summarize hours worked per day");
    it.todo("Summarize hours worked per week");
    it.todo("Summarize hours worked per month");
    it.todo("Summarize hours worked per year");
    it.todo("Summarize hours worked all the time");
    it.todo("Summarize hours worked in a custom period");

    it("Summarize the total hours worked", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-02T15:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-03T15:00:00Z",
              duration: "PT9H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-04T15:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-05T15:00:00Z",
              duration: "PT9H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-06T15:00:00Z",
              duration: "PT8H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(createTestReportQuery({}));

      expect(result.totalHours).toEqual("PT42H");
    });
  });

  describe("Timesheet", () => {
    it("Returns empty result when no activities are logged", async () => {
      const eventStore = EventStore.createNull({ events: [[]] });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet(createTestTimesheetQuery());

      expect(result).toEqual({
        entries: [],
        workingHoursSummary: {
          totalHours: "PT0S",
          capacity: "PT40H",
          offset: "PT0S",
        },
      });
    });

    it("Summarize hours worked on tasks", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            // monday, only same tasks
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-02T10:00:00Z",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-02T10:30:00Z",
            }),
            // tuesday, different tasks
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-03T10:00:00Z",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-03T10:30:00Z",
              task: "Other task",
            }),
            // wednesday, different projects
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-04T10:00:00Z",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-04T10:30:00Z",
              project: "Other project",
            }),
            // thursday, different clients
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-05T10:00:00Z",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-05T10:30:00Z",
              client: "Other client",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet(createTestTimesheetQuery({}));

      expect(result.entries).toEqual([
        createTestTimesheetEntry({ date: "2025-06-02", hours: "PT1H" }),
        createTestTimesheetEntry({
          date: "2025-06-03",
          task: "Other task",
          hours: "PT30M",
        }),
        createTestTimesheetEntry({ date: "2025-06-03", hours: "PT30M" }),
        createTestTimesheetEntry({
          date: "2025-06-04",
          project: "Other project",
          hours: "PT30M",
        }),
        createTestTimesheetEntry({ date: "2025-06-04", hours: "PT30M" }),
        createTestTimesheetEntry({
          date: "2025-06-05",
          client: "Other client",
          hours: "PT30M",
        }),
        createTestTimesheetEntry({ date: "2025-06-05", hours: "PT30M" }),
      ]);
    });

    it.todo("Summarize hours worked per day");
    it.todo("Summarize hours worked per week");
    it.todo("Summarize hours worked per month");

    it("Summarize the total hours worked", async () => {
      const timestamps = [
        "2025-06-02T10:00:00Z",
        "2025-06-02T10:30:00Z",
        "2025-06-02T11:00:00Z",
      ];
      const eventStore = EventStore.createNull({
        events: [
          timestamps.map((timestamp) =>
            ActivityLoggedEvent.createTestData({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet(createTestTimesheetQuery({}));

      expect(result.workingHoursSummary.totalHours).toEqual("PT1H30M");
    });

    it("Compare with capacity", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-10T14:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-11T14:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEvent.createTestData({
              timestamp: "2025-06-12T14:00:00Z",
              duration: "PT8H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-12T16:00:00Z",
      });

      const result = await service.queryTimesheet(
        createTestTimesheetQuery({ from: "2025-06-09", to: "2025-06-15" }),
      );

      expect(result.workingHoursSummary).toEqual({
        totalHours: "PT24H",
        capacity: "PT40H",
        offset: "PT0S",
      });
    });

    it.todo("Take holidays into account");
    it.todo("Take vacation into account");
  });
});
