// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { projectReport } from "../../../src/main/domain/report_projection";
import {
  ActivityLoggedEvent,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  ReportScope,
} from "../../../src/shared/domain/activities";
import { createAsyncGenerator } from "../common/tools";

describe("Report projection", () => {
  it("should return an empty result when no activity is logged", async () => {
    const replay = createAsyncGenerator([]);

    const result = await projectReport(
      replay,
      ReportQuery.create({ scope: ReportScope.PROJECTS }),
    );

    expect(result).toEqual<ReportQueryResult>(
      ReportQueryResult.create({
        entries: [],
        totalHours: "PT0S",
      }),
    );
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

    const result = await projectReport(
      replay,
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
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-08T17:00",
        client: "Client 3",
        duration: "PT7H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-09T17:00",
        client: "Client 2",
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-10T17:00",
        client: "Client 1",
        duration: "PT3H",
      }),
    ]);

    const result = await projectReport(
      replay,
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

  it("should summarize hours worked on projects", async () => {
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-08T17:00",
        project: "Project 1",
        duration: "PT3H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-09T17:00",
        project: "Project 2",
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-10T17:00",
        project: "Project 2",
        duration: "PT7H",
      }),
    ]);

    const result = await projectReport(
      replay,
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

    const result = await projectReport(
      replay,
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
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-08T17:00",
        project: "Project 3",
        duration: "PT3H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-09T17:00",
        project: "Project 2",
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-10T17:00",
        project: "Project 1",
        duration: "PT7H",
      }),
    ]);

    const result = await projectReport(
      replay,
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
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-06-27T17:00",
        task: "Task 1",
        duration: "PT3H",
      }),
    ]);

    const result = await projectReport(
      replay,
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

    const result = await projectReport(
      replay,
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
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-01T17:00",
        client: "Client 2",
        project: "Project 2",
        task: "Task 2",
        duration: "PT1H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-02T17:00",
        client: "Client 2",
        project: "Project 2",
        task: "Task 1",
        duration: "PT2H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-03T17:00",
        client: "Client 1",
        project: "Project 2",
        task: "Task 1",
        duration: "PT3H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-04T17:00",
        client: "Client 1",
        project: "Project 1",
        task: "Task 2",
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-05T17:00",
        client: "Client 1",
        project: "Project 1",
        task: "Task 1",
        duration: "PT8H",
      }),
    ]);

    const result = await projectReport(
      replay,
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

    const result = await projectReport(
      replay,
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
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-06-25T17:00",
        category: "Rework",
        duration: "PT7H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-06-26T17:00",
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-06-27T17:00",
        duration: "PT3H",
      }),
    ]);

    const result = await projectReport(
      replay,
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
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-08T17:00",
        category: "Category 3",
        duration: "PT7H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-09T17:00",
        category: "Category 2",
        duration: "PT5H",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-10T17:00",
        category: "Category 1",
        duration: "PT3H",
      }),
    ]);

    const result = await projectReport(
      replay,
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

  it("should sort by date", async () => {
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-12T12:00",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-11T12:00",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-10T12:00",
      }),
    ]);

    const result = await projectReport(
      replay,
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

  it("should summarize hours worked in a custom period", async () => {
    const replay = createAsyncGenerator([
      // before the period
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-09-14T17:00" }),
      // start of the period
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-09-15T17:00" }),
      // middle of the period
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-09-17T17:00" }),
      // end of the period
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-09-21T17:00" }),
      // after the period
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-09-22T17:00" }),
    ]);

    const result = await projectReport(
      replay,
      ReportQuery.create(
        ReportQuery.create({
          scope: ReportScope.TASKS,
          from: "2025-09-15",
          to: "2025-09-21",
        }),
      ),
    );

    expect(result.totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT1H30M"),
    );
  });
});
