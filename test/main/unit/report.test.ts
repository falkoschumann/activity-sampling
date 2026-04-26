// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { ReportQueryHandler } from "../../../src/main/application/report_query_handler";
import {
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  ReportScope,
} from "../../../src/shared/domain/report_query";
import { Clock } from "../../../src/shared/domain/temporal";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Report", () => {
  describe("Summarize hours worked for clients", () => {
    it("should return an empty result when no activity is logged", async () => {
      const { handler } = configure({ events: [] });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CLIENTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [],
          totalHours: "PT0S",
        }),
      );
    });

    it("should summarize hours worked on clients", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-25T15:00:00Z",
            client: "Client 2",
            duration: "PT7H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-26T15:00:00Z",
            client: "Client 1",
            task: "Task 1",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-27T15:00:00Z",
            client: "Client 1",
            task: "Task 2",
            duration: "PT3H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CLIENTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              client: "Client 1",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              client: "Client 2",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should sort by client when scope is clients", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-08T16:00:00Z",
            client: "Client 3",
            duration: "PT7H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-09T16:00:00Z",
            client: "Client 2",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-10T16:00:00Z",
            client: "Client 1",
            duration: "PT3H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CLIENTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-12-10",
              finish: "2025-12-10",
              client: "Client 1",
              hours: "PT3H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-09",
              finish: "2025-12-09",
              client: "Client 2",
              hours: "PT5H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-08",
              finish: "2025-12-08",
              client: "Client 3",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should sort by date", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-12T11:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-11T11:00:00Z",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-10T11:00:00Z",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CLIENTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-12-10",
              finish: "2025-12-12",
              client: "Test client",
              hours: "PT1H30M",
              cycleTime: 3,
            }),
          ],
          totalHours: "PT1H30M",
        }),
      );
    });
  });

  describe("Summarize hours worked on projects", () => {
    it("should return an empty result when no activity is logged", async () => {
      const { handler } = configure({ events: [] });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.PROJECTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [],
          totalHours: "PT0S",
        }),
      );
    });

    it("should summarize hours worked on projects", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-08T16:00:00Z",
            project: "Project 1",
            duration: "PT3H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-09T16:00:00Z",
            project: "Project 2",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-10T16:00:00Z",
            project: "Project 2",
            duration: "PT7H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.PROJECTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-12-08",
              finish: "2025-12-08",
              client: "Test client",
              project: "Project 1",
              hours: "PT3H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-09",
              finish: "2025-12-10",
              client: "Test client",
              project: "Project 2",
              hours: "PT12H",
              cycleTime: 2,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should aggregate clients for same project when scope is projects", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-02T15:00:00Z",
            client: "Client 2",
            project: "Project 2",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-03T15:00:00Z",
            client: "Client 1",
            project: "Project 1",
            duration: "PT9H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-04T15:00:00Z",
            client: "Client 2",
            project: "Project 2",
            duration: "PT8H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-05T15:00:00Z",
            client: "Client 1",
            project: "Project 1",
            duration: "PT9H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-06T15:00:00Z",
            client: "Client 1",
            project: "Project 2",
            duration: "PT8H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.PROJECTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-03",
              finish: "2025-06-05",
              project: "Project 1",
              client: "Client 1",
              hours: "PT18H",
              cycleTime: 3,
            }),
            ReportEntry.create({
              start: "2025-06-02",
              finish: "2025-06-06",
              project: "Project 2",
              client: "Client 1, Client 2",
              hours: "PT24H",
              cycleTime: 5,
            }),
          ],
          totalHours: "PT42H",
        }),
      );
    });

    it("should sort by project when scope is projects", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-08T16:00:00Z",
            project: "Project 3",
            duration: "PT3H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-09T16:00:00Z",
            project: "Project 2",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-10T16:00:00Z",
            project: "Project 1",
            duration: "PT7H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.PROJECTS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-12-10",
              finish: "2025-12-10",
              client: "Test client",
              project: "Project 1",
              hours: "PT7H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-09",
              finish: "2025-12-09",
              client: "Test client",
              project: "Project 2",
              hours: "PT5H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-08",
              finish: "2025-12-08",
              client: "Test client",
              project: "Project 3",
              hours: "PT3H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });
  });

  describe("Summarize hours worked on tasks", () => {
    it("should return an empty result when no activity is logged", async () => {
      const { handler } = configure({ events: [] });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.TASKS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [],
          totalHours: "PT0S",
        }),
      );
    });

    it("should summarize hours worked on tasks", async () => {
      const { handler } = configure({
        events: [
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
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.TASKS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              client: "Test client",
              project: "Test project",
              task: "Task 1",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              client: "Test client",
              project: "Test project",
              task: "Task 2",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should aggregate categories for same task when scope is tasks", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-25T15:00:00Z",
            task: "Task 2",
            duration: "PT7H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-26T15:00:00Z",
            task: "Task 1",
            category: "Feature",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-27T15:00:00Z",
            task: "Task 1",
            category: "Rework",
            duration: "PT3H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.TASKS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              client: "Test client",
              project: "Test project",
              task: "Task 1",
              category: "Feature, Rework",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              client: "Test client",
              project: "Test project",
              task: "Task 2",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should sort by task, project and client when scope is tasks", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-01T16:00:00Z",
            client: "Client 2",
            project: "Project 2",
            task: "Task 2",
            duration: "PT1H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-02T16:00:00Z",
            client: "Client 2",
            project: "Project 2",
            task: "Task 1",
            duration: "PT2H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-03T16:00:00Z",
            client: "Client 1",
            project: "Project 2",
            task: "Task 1",
            duration: "PT3H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-04T16:00:00Z",
            client: "Client 1",
            project: "Project 1",
            task: "Task 2",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-05T16:00:00Z",
            client: "Client 1",
            project: "Project 1",
            task: "Task 1",
            duration: "PT8H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.TASKS }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-12-05",
              finish: "2025-12-05",
              client: "Client 1",
              project: "Project 1",
              task: "Task 1",
              hours: "PT8H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-03",
              finish: "2025-12-03",
              client: "Client 1",
              project: "Project 2",
              task: "Task 1",
              hours: "PT3H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-02",
              finish: "2025-12-02",
              client: "Client 2",
              project: "Project 2",
              task: "Task 1",
              hours: "PT2H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-04",
              finish: "2025-12-04",
              client: "Client 1",
              project: "Project 1",
              task: "Task 2",
              hours: "PT5H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-01",
              finish: "2025-12-01",
              client: "Client 2",
              project: "Project 2",
              task: "Task 2",
              hours: "PT1H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT19H",
        }),
      );
    });
  });

  describe("Summarize hours worked on categories", () => {
    it("should return an empty result when no activity is logged", async () => {
      const { handler } = configure({ events: [] });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CATEGORIES }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [],
          totalHours: "PT0S",
        }),
      );
    });

    it("should summarize hours worked on categories", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-25T15:00:00Z",
            category: "Rework",
            duration: "PT7H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-26T15:00:00Z",
            category: "Feature",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-27T15:00:00Z",
            category: "Feature",
            duration: "PT3H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CATEGORIES }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              category: "Feature",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              category: "Rework",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should combine all task without category when scope is categories", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-25T15:00:00Z",
            category: "Rework",
            duration: "PT7H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-26T15:00:00Z",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-06-27T15:00:00Z",
            duration: "PT3H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CATEGORIES }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              category: "N/A",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              category: "Rework",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });

    it("should sort by category when scope is categories", async () => {
      const { handler } = configure({
        events: [
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-08T16:00:00Z",
            category: "Category 3",
            duration: "PT7H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-09T16:00:00Z",
            category: "Category 2",
            duration: "PT5H",
          }),
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-12-10T16:00:00Z",
            category: "Category 1",
            duration: "PT3H",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({ scope: ReportScope.CATEGORIES }),
      );

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-12-10",
              finish: "2025-12-10",
              category: "Category 1",
              hours: "PT3H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-09",
              finish: "2025-12-09",
              category: "Category 2",
              hours: "PT5H",
              cycleTime: 1,
            }),
            ReportEntry.create({
              start: "2025-12-08",
              finish: "2025-12-08",
              category: "Category 3",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });
  });

  describe("Summarize the total hours worked", () => {
    it("should return report", async () => {
      const { handler } = configure({
        events: [
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
        ],
      });

      const result = await handler.handle({ scope: ReportScope.CLIENTS });

      expect(result).toEqual<ReportQueryResult>(
        ReportQueryResult.create({
          entries: [
            ReportEntry.create({
              start: "2025-06-26",
              finish: "2025-06-27",
              client: "Client 1",
              hours: "PT8H",
              cycleTime: 2,
            }),
            ReportEntry.create({
              start: "2025-06-25",
              finish: "2025-06-25",
              client: "Client 2",
              hours: "PT7H",
              cycleTime: 1,
            }),
          ],
          totalHours: "PT15H",
        }),
      );
    });
  });

  describe("Summarize in a period", () => {
    it("should summarize hours worked in a custom period", async () => {
      const { handler } = configure({
        events: [
          // before the period
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-14T15:00:00Z",
          }),
          // start of the period
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-15T15:00:00Z",
          }),
          // middle of the period
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-17T15:00:00Z",
          }),
          // end of the period
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-21T15:00:00Z",
          }),
          // after the period
          ActivityLoggedEvent.createTestInstance({
            timestamp: "2025-09-22T15:00:00Z",
          }),
        ],
      });

      const result = await handler.handle(
        ReportQuery.create({
          scope: ReportScope.TASKS,
          from: "2025-09-15",
          to: "2025-09-21",
        }),
      );

      expect(result.totalHours).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT1H30M"),
      );
    });
  });
});

function configure({
  events,
  fixedInstant,
}: {
  events?: ActivityLoggedEvent[];
  fixedInstant?: string;
} = {}) {
  const eventStore = EventStore.createNull({ events });
  const clock = Clock.fixed(
    fixedInstant ?? "1970-01-01T00:00:00Z",
    "Europe/Berlin",
  );
  const handler = ReportQueryHandler.create({ eventStore, clock });
  return { handler };
}
