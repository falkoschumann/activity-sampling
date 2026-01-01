// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { projectTimesheet } from "../../../src/main/domain/timesheet_projection";
import { Holiday, Vacation } from "../../../src/main/domain/calendar";
import {
  ActivityLoggedEvent,
  Capacity,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../../src/shared/domain/activities";
import { createAsyncGenerator } from "../common/tools";

describe("Timesheet projection", () => {
  it("should return an empty result when no activities are logged", async () => {
    const replay = createAsyncGenerator([]);

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-09-15",
        to: "2025-09-21",
      }),
    );

    expect(result).toEqual<TimesheetQueryResult>(
      TimesheetQueryResult.create({
        entries: [],
        totalHours: "PT0S",
        capacity: Capacity.create({
          hours: "PT40H",
          offset: "-PT40H",
        }),
      }),
    );
  });

  it("should summarize hours worked", async () => {
    const replay = createAsyncGenerator([
      // last sunday, excluded because last week
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-06-01T12:00",
      }),
      // monday, same task
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
      // friday to sunday, no activities logged
      // next monday, excluded because next week
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-06-09T12:00",
      }),
    ]);

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-02",
        to: "2025-06-08",
        today: "2025-11-19",
      }),
    );

    expect(result.entries).toEqual<TimesheetEntry[]>([
      TimesheetEntry.createTestInstance({
        date: "2025-06-02",
        hours: "PT1H",
      }),
      TimesheetEntry.createTestInstance({
        date: "2025-06-03",
        task: "Other task",
        hours: "PT30M",
      }),
      TimesheetEntry.createTestInstance({
        date: "2025-06-03",
        hours: "PT30M",
      }),
      TimesheetEntry.createTestInstance({
        date: "2025-06-04",
        project: "Other project",
        hours: "PT30M",
      }),
      TimesheetEntry.createTestInstance({
        date: "2025-06-04",
        hours: "PT30M",
      }),
      TimesheetEntry.createTestInstance({
        date: "2025-06-05",
        client: "Other client",
        hours: "PT30M",
      }),
      TimesheetEntry.createTestInstance({
        date: "2025-06-05",
        hours: "PT30M",
      }),
    ]);
  });

  it("should summarize the total hours worked", async () => {
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-02T12:00" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-02T12:30" }),
      ActivityLoggedEvent.createTestInstance({ dateTime: "2025-06-02T13:00" }),
    ]);

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-02",
        to: "2025-06-08",
        today: "2025-11-19",
      }),
    );

    expect(result.totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT1H30M"),
    );
  });

  it("should return the offset 0 when capacity is reached", async () => {
    // query a week on thursday
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

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
    );

    expect(result.totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT32H"),
    );
    expect(result.capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "PT0S" }),
    );
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

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
    );

    expect(result.capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "-PT6H" }),
    );
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

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
    );

    expect(result.capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "PT6H" }),
    );
  });

  it("should return the offset for capacity in the future", async () => {
    // query a week on thursday
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

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-03",
      }),
    );

    expect(result.totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT32H"),
    );
    expect(result.capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "PT24h" }),
    );
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

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
      {
        holidays: [
          Holiday.create({ date: "2025-06-09", title: "Pfingstmontag" }),
        ],
      },
    );

    expect(result.capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT32H", offset: "PT0S" }),
    );
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

    const result = await projectTimesheet(
      replay,
      TimesheetQuery.create({
        from: "2025-09-08",
        to: "2025-09-14",
        today: "2025-09-11",
      }),
      { vacations: [Vacation.create({ date: "2025-09-10" })] },
    );

    expect(result.capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT32H", offset: "PT0S" }),
    );
  });
});
