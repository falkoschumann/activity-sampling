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

describe("Report projection", () => {
  it("should return an empty result when no activity is logged", async () => {
    const replay = createAsyncGenerator([]);

    const result = await projectReport(
      replay,
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

// TODO extract helper functions

async function* createAsyncGenerator<T>(array: T[]) {
  for (const element of array) {
    yield element;
  }
}

function mapTimestamps(dateTimes: string[]) {
  return dateTimes.map((dateTime) =>
    ActivityLoggedEvent.createTestInstance({ dateTime }),
  );
}
