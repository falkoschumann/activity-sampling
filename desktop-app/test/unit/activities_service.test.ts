// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { CommandStatus } from "../../src/shared/common/messages";
import {
  Activity,
  ReportEntry,
  TimesheetEntry,
  TimesheetQuery,
  LogActivityCommand,
  RecentActivitiesQuery,
  ReportQuery,
  Scope,
} from "../../src/shared/domain/activities";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../src/main/infrastructure/events";
import { HolidayRepository } from "../../src/main/infrastructure/holiday_repository";

describe("Activities service", () => {
  describe("Log activity", () => {
    describe("Log the activity with a client, a project, a task and an optional notes", () => {
      it("Logs without an optional notes", async () => {
        const eventStore = EventStore.createNull();
        const service = ActivitiesService.createNull({ eventStore });
        const recordEvents = eventStore.trackRecorded();

        const status = await service.logActivity(
          LogActivityCommand.createTestInstance(),
        );

        expect(status).toEqual(CommandStatus.success());
        expect(recordEvents.data).toEqual([
          ActivityLoggedEventDto.createTestData(),
        ]);
      });

      it("Logs with an optional notes", async () => {
        const eventStore = EventStore.createNull();
        const service = ActivitiesService.createNull({ eventStore });
        const recordEvents = eventStore.trackRecorded();

        const status = await service.logActivity(
          LogActivityCommand.createTestInstance({ notes: "Lorem ipsum" }),
        );

        expect(status).toEqual(CommandStatus.success());
        expect(recordEvents.data).toEqual([
          ActivityLoggedEventDto.createTestData({ notes: "Lorem ipsum" }),
        ]);
      });

      it.todo("Select an activity from recent activities");
      it.todo("Select the last activity when the application starts");
    });
  });

  describe("Recent activities", () => {
    it("Returns empty result when no activities are logged", async () => {
      const eventStore = EventStore.createNull({
        events: [[]],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryRecentActivities(
        new RecentActivitiesQuery(),
      );

      expect(result).toEqual({
        lastActivity: undefined,
        workingDays: [],
        timeSummary: {
          hoursToday: Temporal.Duration.from("PT0S"),
          hoursYesterday: Temporal.Duration.from("PT0S"),
          hoursThisWeek: Temporal.Duration.from("PT0S"),
          hoursThisMonth: Temporal.Duration.from("PT0S"),
        },
      });
    });

    it("Returns last activity", async () => {
      const eventStore = EventStore.createNull({
        events: [[ActivityLoggedEventDto.createTestData()]],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-08-20T09:03:00Z",
      });

      const result = await service.queryRecentActivities(
        new RecentActivitiesQuery(),
      );

      expect(result.lastActivity).toEqual(Activity.createTestInstance());
    });

    it("Groups activities by working days for the last 30 days", async () => {
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
            ActivityLoggedEventDto.createTestData({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-05T10:00:00Z",
      });

      const result = await service.queryRecentActivities(
        new RecentActivitiesQuery(),
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

    it("Summarizes hours worked today, yesterday, this week and this month", async () => {
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
        "2025-06-06T08:30:00Z",
        // last day of this month
        "2025-06-30T08:30:00Z",
        // the first day of next month
        "2025-07-01T10:30:00Z", // is not included
      ];
      const eventStore = EventStore.createNull({
        events: [
          timestamps.map((timestamp) =>
            ActivityLoggedEventDto.createTestData({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-05T10:00:00Z",
      });

      const result = await service.queryRecentActivities(
        new RecentActivitiesQuery(),
      );

      expect(result.timeSummary).toEqual({
        hoursToday: Temporal.Duration.from("PT1H"),
        hoursYesterday: Temporal.Duration.from("PT1H30M"),
        hoursThisWeek: Temporal.Duration.from("PT4H"),
        hoursThisMonth: Temporal.Duration.from("PT5H30M"),
      });
    });
  });

  describe("Reports", () => {
    it("Returns empty result when no activities are logged", async () => {
      const eventStore = EventStore.createNull({ events: [[]] });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        ReportQuery.createTestInstance({
          scope: Scope.TASKS,
        }),
      );

      expect(result).toEqual({
        entries: [],
        totalHours: Temporal.Duration.from("PT0S"),
      });
    });

    it("Summarizes hours worked for clients", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-25T15:00:00Z",
              client: "Client 2",
              duration: "PT7H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-26T15:00:00Z",
              client: "Client 1",
              duration: "PT5H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-27T15:00:00Z",
              client: "Client 1",
              duration: "PT3H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        ReportQuery.createTestInstance({
          scope: Scope.CLIENTS,
        }),
      );

      expect(result.entries).toEqual([
        ReportEntry.createTestInstance({
          name: "Client 1",
          hours: Temporal.Duration.from("PT8H"),
        }),
        ReportEntry.createTestInstance({
          name: "Client 2",
          hours: Temporal.Duration.from("PT7H"),
        }),
      ]);
    });

    it("Summarizes hours worked on projects", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-02T15:00:00Z",
              client: "Client 2",
              project: "Project B",
              duration: "PT8H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-03T15:00:00Z",
              client: "Client 1",
              project: "Project A",
              duration: "PT9H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-04T15:00:00Z",
              client: "Client 2",
              project: "Project B",
              duration: "PT8H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-05T15:00:00Z",
              client: "Client 1",
              project: "Project A",
              duration: "PT9H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-06T15:00:00Z",
              client: "Client 2",
              project: "Project B",
              duration: "PT8H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        ReportQuery.createTestInstance({}),
      );

      expect(result.entries).toEqual([
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
      ]);
    });

    it.todo(
      "Summarizes hours worked on projects and combines projects with multiple clients",
    );

    it("Summarizes hours worked on tasks", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-25T15:00:00Z",
              task: "Task 2",
              duration: "PT7H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-26T15:00:00Z",
              task: "Task 1",
              duration: "PT5H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-27T15:00:00Z",
              task: "Task 1",
              duration: "PT3H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        ReportQuery.createTestInstance({
          scope: Scope.TASKS,
        }),
      );

      expect(result.entries).toEqual([
        ReportEntry.createTestInstance({
          name: "Task 1",
          hours: Temporal.Duration.from("PT8H"),
        }),
        ReportEntry.createTestInstance({
          name: "Task 2",
          hours: Temporal.Duration.from("PT7H"),
        }),
      ]);
    });

    it.todo("Summarize hours worked per day");
    it.todo("Summarize hours worked per week");
    it.todo("Summarize hours worked per month");
    it.todo("Summarize hours worked per year");
    it.todo("Summarize hours worked all the time");
    it.todo("Summarize hours worked in a custom period");

    it("Summarizes the total hours worked", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-02T15:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-03T15:00:00Z",
              duration: "PT9H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-04T15:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-05T15:00:00Z",
              duration: "PT9H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-06T15:00:00Z",
              duration: "PT8H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryReport(
        ReportQuery.createTestInstance({}),
      );

      expect(result.totalHours).toEqual(Temporal.Duration.from("PT42H"));
    });
  });

  describe("Timesheet", () => {
    it("Returns empty result when no activities are logged", async () => {
      const eventStore = EventStore.createNull({ events: [[]] });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet(
        TimesheetQuery.createTestInstance(),
      );

      expect(result).toEqual({
        entries: [],
        workingHoursSummary: {
          totalHours: Temporal.Duration.from("PT0S"),
          capacity: Temporal.Duration.from("PT40H"),
          offset: Temporal.Duration.from("PT0S"),
        },
      });
    });

    it("Summarizes hours worked on tasks", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            // monday, only same tasks
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-02T10:00:00Z",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-02T10:30:00Z",
            }),
            // tuesday, different tasks
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-03T10:00:00Z",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-03T10:30:00Z",
              task: "Other task",
            }),
            // wednesday, different projects
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-04T10:00:00Z",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-04T10:30:00Z",
              project: "Other project",
            }),
            // thursday, different clients
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-05T10:00:00Z",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-05T10:30:00Z",
              client: "Other client",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet(
        TimesheetQuery.createTestInstance({}),
      );

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

    it.todo("Summarize hours worked per day");
    it.todo("Summarize hours worked per week");
    it.todo("Summarize hours worked per month");

    it("Summarizes the total hours worked", async () => {
      const timestamps = [
        "2025-06-02T10:00:00Z",
        "2025-06-02T10:30:00Z",
        "2025-06-02T11:00:00Z",
      ];
      const eventStore = EventStore.createNull({
        events: [
          timestamps.map((timestamp) =>
            ActivityLoggedEventDto.createTestData({ timestamp }),
          ),
        ],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryTimesheet(
        TimesheetQuery.createTestInstance({}),
      );

      expect(result.workingHoursSummary.totalHours).toEqual(
        Temporal.Duration.from("PT1H30M"),
      );
    });

    it("Compares with capacity", async () => {
      const eventStore = EventStore.createNull({
        events: [
          [
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-09T14:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-10T14:00:00Z",
              duration: "PT8H",
            }),
            ActivityLoggedEventDto.createTestData({
              timestamp: "2025-06-11T14:00:00Z",
              duration: "PT8H",
            }),
          ],
        ],
      });
      const service = ActivitiesService.createNull({
        eventStore,
        fixedInstant: "2025-06-11T16:00:00Z",
      });

      const result = await service.queryTimesheet(
        TimesheetQuery.createTestInstance({
          from: Temporal.PlainDate.from("2025-06-09"),
          to: Temporal.PlainDate.from("2025-06-15"),
        }),
      );

      expect(result.workingHoursSummary).toEqual({
        totalHours: Temporal.Duration.from("PT24H"),
        capacity: Temporal.Duration.from("PT40H"),
        offset: Temporal.Duration.from("PT0S"),
      });
    });

    describe("Take holidays into account", () => {
      it("Returns offset 0 when capacity is reached", async () => {
        const eventStore = EventStore.createNull({
          events: [
            [
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-10T14:00:00Z",
                duration: "PT8H",
              }),
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-11T14:00:00Z",
                duration: "PT8H",
              }),
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-12T14:00:00Z",
                duration: "PT8H",
              }),
            ],
          ],
        });
        const holidayRepository = HolidayRepository.createNull({
          holidays: [[{ date: "2025-06-09", title: "Pfingstmontag" }]],
        });
        const service = ActivitiesService.createNull({
          eventStore,
          holidayRepository,
          fixedInstant: "2025-06-12T16:00:00Z",
        });

        const result = await service.queryTimesheet(
          TimesheetQuery.createTestInstance({
            from: Temporal.PlainDate.from("2025-06-09"),
            to: Temporal.PlainDate.from("2025-06-15"),
          }),
        );

        expect(result.workingHoursSummary).toEqual({
          totalHours: Temporal.Duration.from("PT24H"),
          capacity: Temporal.Duration.from("PT32H"),
          offset: Temporal.Duration.from("PT0S"),
        });
      });

      it("Returns negative offset when hours is behind of the capacity", async () => {
        const eventStore = EventStore.createNull({
          events: [
            [
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-10T14:00:00Z",
                duration: "PT6H",
              }),
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-11T14:00:00Z",
                duration: "PT6H",
              }),
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-12T14:00:00Z",
                duration: "PT6H",
              }),
            ],
          ],
        });
        const holidayRepository = HolidayRepository.createNull({
          holidays: [[{ date: "2025-06-09", title: "Pfingstmontag" }]],
        });
        const service = ActivitiesService.createNull({
          eventStore,
          holidayRepository,
          fixedInstant: "2025-06-12T16:00:00Z",
        });

        const result = await service.queryTimesheet(
          TimesheetQuery.createTestInstance({
            from: Temporal.PlainDate.from("2025-06-09"),
            to: Temporal.PlainDate.from("2025-06-15"),
          }),
        );

        expect(result.workingHoursSummary).toEqual({
          totalHours: Temporal.Duration.from("PT18H"),
          capacity: Temporal.Duration.from("PT32H"),
          offset: Temporal.Duration.from("-PT6H"),
        });
      });

      it("Returns positive offset when hours is ahead of the capacity", async () => {
        const eventStore = EventStore.createNull({
          events: [
            [
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-10T14:00:00Z",
                duration: "PT10H",
              }),
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-11T14:00:00Z",
                duration: "PT10H",
              }),
              ActivityLoggedEventDto.createTestData({
                timestamp: "2025-06-12T14:00:00Z",
                duration: "PT10H",
              }),
            ],
          ],
        });
        const holidayRepository = HolidayRepository.createNull({
          holidays: [[{ date: "2025-06-09", title: "Pfingstmontag" }]],
        });
        const service = ActivitiesService.createNull({
          eventStore,
          holidayRepository,
          fixedInstant: "2025-06-12T16:00:00Z",
        });

        const result = await service.queryTimesheet(
          TimesheetQuery.createTestInstance({
            from: Temporal.PlainDate.from("2025-06-09"),
            to: Temporal.PlainDate.from("2025-06-15"),
          }),
        );

        expect(result.workingHoursSummary).toEqual({
          totalHours: Temporal.Duration.from("PT30H"),
          capacity: Temporal.Duration.from("PT32H"),
          offset: Temporal.Duration.from("PT6H"),
        });
      });
    });

    it.todo("Take vacation into account");
  });
});
