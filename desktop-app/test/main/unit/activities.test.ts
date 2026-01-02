// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import { createAsyncGenerator } from "../common/tools";
import { ActivityLoggedEvent } from "../../../src/shared/domain/activities";
import {
  ActivitiesProjection,
  Activity,
  CategoriesProjection,
  filterEvents,
  TotalHoursProjection,
} from "../../../src/main/domain/activities";

describe("Activities", () => {
  describe("Activities projection", () => {
    it("should return empty array when no event is logged", () => {
      const projection = new ActivitiesProjection();

      expect(projection.get()).toEqual([]);
    });

    it("should join same activities", () => {
      const projection = new ActivitiesProjection();

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-12-01T12:00",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-12-02T10:00",
          duration: "PT2H",
        }),
      );

      expect(projection.get()).toEqual([
        Activity.createTestInstance({
          start: Temporal.PlainDate.from("2025-12-01"),
          finish: Temporal.PlainDate.from("2025-12-02"),
          hours: Temporal.Duration.from("PT6H"),
        }),
      ]);
    });

    it("should aggregate different activities", () => {
      const projection = new ActivitiesProjection();

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-12-01T12:00",
          task: "Task A",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-12-02T10:00",
          task: "Task B",
          duration: "PT2H",
        }),
      );

      expect(projection.get()).toEqual([
        Activity.createTestInstance({
          start: Temporal.PlainDate.from("2025-12-01"),
          finish: Temporal.PlainDate.from("2025-12-01"),
          task: "Task A",
          hours: Temporal.Duration.from("PT4H"),
        }),
        Activity.createTestInstance({
          start: Temporal.PlainDate.from("2025-12-02"),
          finish: Temporal.PlainDate.from("2025-12-02"),
          task: "Task B",
          hours: Temporal.Duration.from("PT2H"),
        }),
      ]);
    });

    it("should filter activities by categories", () => {
      const projection = new ActivitiesProjection(["Development", "Design"]);

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Design",
          dateTime: "2025-12-03T09:00",
          duration: "PT3H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
          dateTime: "2025-12-01T12:00",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Testing",
          dateTime: "2025-12-02T10:00",
          duration: "PT2H",
        }),
      );

      expect(projection.get()).toEqual([
        Activity.createTestInstance({
          start: Temporal.PlainDate.from("2025-12-01"),
          finish: Temporal.PlainDate.from("2025-12-03"),
          hours: Temporal.Duration.from("PT7H"),
        }),
      ]);
    });

    it("should handle empty string as no category", () => {
      const projection = new ActivitiesProjection([""]);

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
          dateTime: "2025-12-01T12:00",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-12-02T10:00",
          duration: "PT2H",
        }),
      );

      expect(projection.get()).toEqual([
        Activity.createTestInstance({
          start: Temporal.PlainDate.from("2025-12-02"),
          finish: Temporal.PlainDate.from("2025-12-02"),
          hours: Temporal.Duration.from("PT2H"),
        }),
      ]);
    });

    it("should handle empty category array as no filter", () => {
      const projection = new ActivitiesProjection([]);

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
          dateTime: "2025-12-01T12:00",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-12-02T10:00",
          duration: "PT2H",
        }),
      );

      expect(projection.get()).toEqual([
        Activity.createTestInstance({
          start: Temporal.PlainDate.from("2025-12-01"),
          finish: Temporal.PlainDate.from("2025-12-02"),
          hours: Temporal.Duration.from("PT6H"),
        }),
      ]);
    });
  });

  describe("Categories projection", () => {
    it("should return empty array when no event is logged", () => {
      const projection = new CategoriesProjection();

      expect(projection.get()).toEqual([]);
    });

    it("should accumulate unique categories", () => {
      const projection = new CategoriesProjection();

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Testing",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Design",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
        }),
      );

      expect(projection.get()).toEqual(["Design", "Development", "Testing"]);
    });

    it("should handle no category", () => {
      const projection = new CategoriesProjection();

      projection.update(ActivityLoggedEvent.createTestInstance());
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Design",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
        }),
      );

      expect(projection.get()).toEqual(["", "Design", "Development"]);
    });
  });

  describe("Total hours projection", () => {
    it("should return zero when no event is logged", () => {
      const projection = new TotalHoursProjection();

      expect(projection.get()).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT0H"),
      );
    });

    it("should accumulate total hours from logged activities", () => {
      const projection = new TotalHoursProjection();

      projection.update(
        ActivityLoggedEvent.createTestInstance({ duration: "PT2H" }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({ duration: "PT3H30M" }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({ duration: "PT1H15M" }),
      );

      expect(projection.get()).toEqual<Temporal.Duration>(
        Temporal.Duration.from("PT6H45M"),
      );
    });
  });

  describe("Filter events", () => {
    it("should emit nothing when no event is logged", async () => {
      const replay = createAsyncGenerator([]);

      const events = await Array.fromAsync(replay);

      expect(events).toEqual([]);
    });

    it("should filter events by date range", async () => {
      const before = ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-08T10:00:00",
      });
      const start = ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-09T10:00:00",
      });
      const middle = ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-10T10:00:00",
      });
      const end = ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-11T10:00:00",
      });
      const after = ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-12-12T10:00:00",
      });
      const replay = createAsyncGenerator([before, start, middle, end, after]);

      const generator = filterEvents(replay, "2025-12-09", "2025-12-11");

      const events = await Array.fromAsync(generator);
      expect(events).toEqual<ActivityLoggedEvent[]>([start, middle, end]);
    });
  });
});
