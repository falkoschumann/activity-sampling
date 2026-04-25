// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { TimesheetProjection } from "../../../src/main/domain/timesheet_projection";
import {
  Capacity,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../../src/shared/domain/timesheet_query";
import { Holiday, Vacation } from "../../../src/main/domain/calendar";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";

describe("Timesheet projection", () => {
  it("should return an empty result when no activities are logged", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-09-15",
        to: "2025-09-21",
      }),
    });

    expect(projection.get()).toEqual<TimesheetQueryResult>(
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
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-02",
        to: "2025-06-08",
        today: "2025-11-19",
      }),
    });

    // last sunday, excluded because last week
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-01T10:00:00Z",
      }),
    );
    // monday, same task
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-02T10:00:00Z",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-02T10:30:00Z",
      }),
    );
    // tuesday, different tasks
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-03T10:00:00Z",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-03T10:30:00Z",
        task: "Other task",
      }),
    );
    // wednesday, different projects
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-04T10:00:00Z",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-04T10:30:00Z",
        project: "Other project",
      }),
    );
    // thursday, different clients
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-05T10:00:00Z",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-05T10:30:00Z",
        client: "Other client",
      }),
    );
    // friday to sunday, no activities logged
    // next monday, excluded because next week
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-09T10:00:00Z",
      }),
    );

    expect(projection.get().entries).toEqual<TimesheetEntry[]>([
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
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-02",
        to: "2025-06-08",
        today: "2025-11-19",
      }),
    });

    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-02T10:00:00Z",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-02T10:30:00Z",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-02T11:00:00Z",
      }),
    );

    expect(projection.get().totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT1H30M"),
    );
  });

  it("should return the offset 0 when capacity is reached", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
    });

    // query a week on thursday
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-09T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-10T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-11T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-12T14:00:00Z",
        duration: "PT8H",
      }),
    );

    expect(projection.get().totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT32H"),
    );
    expect(projection.get().capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "PT0S" }),
    );
  });

  it("should return a negative offset when hours is behind of the capacity", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
    });

    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-09T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-10T14:00:00Z",
        duration: "PT6H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-11T14:00:00Z",
        duration: "PT6H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-12T14:00:00Z",
        duration: "PT6H",
      }),
    );

    expect(projection.get().capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "-PT6H" }),
    );
  });

  it("should return a positive offset when hours is ahead of the capacity", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
    });

    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-09T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-10T14:00:00Z",
        duration: "PT10H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-11T14:00:00Z",
        duration: "PT10H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-12T14:00:00Z",
        duration: "PT10H",
      }),
    );

    expect(projection.get().capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "PT6H" }),
    );
  });

  it("should return the offset for capacity in the future", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-03",
      }),
    });

    // query a week on thursday
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-09T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-10T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-11T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-12T14:00:00Z",
        duration: "PT8H",
      }),
    );

    expect(projection.get().totalHours).toEqual<Temporal.Duration>(
      Temporal.Duration.from("PT32H"),
    );
    expect(projection.get().capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT40H", offset: "PT24h" }),
    );
  });

  it("should take holidays into account", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-06-09",
        to: "2025-06-15",
        today: "2025-06-12",
      }),
      holidays: [
        Holiday.create({ date: "2025-06-09", title: "Pfingstmontag" }),
      ],
    });

    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-10T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-11T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-06-12T14:00:00Z",
        duration: "PT8H",
      }),
    );

    expect(projection.get().capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT32H", offset: "PT0S" }),
    );
  });

  it("should take vacation into account", async () => {
    const projection = TimesheetProjection.create({
      query: TimesheetQuery.create({
        from: "2025-09-08",
        to: "2025-09-14",
        today: "2025-09-11",
      }),
      vacations: [Vacation.create({ date: "2025-09-10" })],
    });

    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-09-08T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-09-09T14:00:00Z",
        duration: "PT8H",
      }),
    );
    projection.update(
      ActivityLoggedEvent.createTestInstance({
        timestamp: "2025-09-11T14:00:00Z",
        duration: "PT8H",
      }),
    );

    expect(projection.get().capacity).toEqual<Capacity>(
      Capacity.create({ hours: "PT32H", offset: "PT0S" }),
    );
  });
});
