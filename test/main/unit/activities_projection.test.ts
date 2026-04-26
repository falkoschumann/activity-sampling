// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import {
  ActivitiesProjection,
  Activity,
} from "../../../src/main/domain/activities_projection";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";

describe("Activities", () => {
  describe("Activities projection", () => {
    it("should return empty array when no event is logged", () => {
      const projection = ActivitiesProjection.create({});

      expect(projection.get()).toEqual([]);
    });

    it("should join same activities", () => {
      const projection = ActivitiesProjection.create({});

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-12-01T11:00:00Z",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-12-02T09:00:00Z",
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
      const projection = ActivitiesProjection.create({});

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-12-01T11:00:00Z",
          task: "Task A",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-12-02T09:00:00Z",
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
      const projection = ActivitiesProjection.create({
        categories: ["Development", "Design"],
      });

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Design",
          timestamp: "2025-12-03T08:00:00Z",
          duration: "PT3H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
          timestamp: "2025-12-01T11:00:00Z",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Testing",
          timestamp: "2025-12-02T09:00:00Z",
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
      const projection = ActivitiesProjection.create({ categories: [""] });

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
          timestamp: "2025-12-01T11:00:00Z",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-12-02T09:00:00Z",
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
      const projection = ActivitiesProjection.create({ categories: [] });

      projection.update(
        ActivityLoggedEvent.createTestInstance({
          category: "Development",
          timestamp: "2025-12-01T11:00:00Z",
          duration: "PT4H",
        }),
      );
      projection.update(
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-12-02T09:00:00Z",
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
});
