// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { EstimateQueryHandler } from "../../../src/main/application/estimate_query_handler";
import { Clock } from "../../../src/shared/domain/temporal";
import {
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../../../src/shared/domain/estimate_query";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Estimate", () => {
  describe("Estimate tasks with cycle times", () => {
    it("should return an empty list when no activity is logged", async () => {
      const { handler } = configure({ events: [] });

      const result = await handler.handle(EstimateQuery.create({}));

      expect(result.cycleTimes).toEqual<EstimateEntry[]>([]);
    });

    it("should calculate the probability of cycle times", async () => {
      const events = [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task A",
          category: "Category 3",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task B",
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task C",
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-04T09:00:00Z",
          task: "Task C",
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-05T09:00:00Z",
          task: "Task D",
          category: "Category 3",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task D",
          category: "Category 3",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.handle(EstimateQuery.create({}));

      expect(result).toEqual<EstimateQueryResult>(
        EstimateQueryResult.create({
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
          categories: ["Category 1", "Category 2", "Category 3"],
          totalCount: 4,
        }),
      );
    });

    it("should join the cycle time of an activity with multiple categories", async () => {
      const events = [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task B",
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-04T09:00:00Z",
          task: "Task A",
          category: "Category 2",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.handle(EstimateQuery.create({}));

      expect(result).toEqual<EstimateQueryResult>(
        EstimateQueryResult.create({
          cycleTimes: [
            {
              cycleTime: 1,
              frequency: 1,
              probability: 0.5,
              cumulativeProbability: 0.5,
            },
            {
              cycleTime: 2,
              frequency: 1,
              probability: 0.5,
              cumulativeProbability: 1.0,
            },
          ],
          categories: ["Category 1", "Category 2"],
          totalCount: 2,
        }),
      );
    });
  });

  describe("Filter tasks by category", () => {
    it("should filter activities by category", async () => {
      const events = [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task B",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-04T09:00:00Z",
          task: "Task C",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-05T09:00:00Z",
          task: "Task A",
          category: "Category B",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.handle(
        EstimateQuery.create({ categories: ["Category A"] }),
      );

      expect(result).toEqual<EstimateQueryResult>(
        EstimateQueryResult.create({
          cycleTimes: [
            {
              cycleTime: 1,
              frequency: 2,
              probability: 1.0,
              cumulativeProbability: 1.0,
            },
          ],
          categories: ["Category A", "Category B"],
          totalCount: 2,
        }),
      );
    });

    it("should filter activities without a category", async () => {
      const events = [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task A",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task B",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-04T09:00:00Z",
          task: "Task C",
          category: "Testing Category",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-05T09:00:00Z",
          task: "Task A",
          category: "Testing Category",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.handle(
        EstimateQuery.create({ categories: [""] }),
      );

      expect(result).toEqual<EstimateQueryResult>(
        EstimateQueryResult.create({
          cycleTimes: [
            {
              cycleTime: 1,
              frequency: 2,
              probability: 1.0,
              cumulativeProbability: 1.0,
            },
          ],
          categories: ["", "Testing Category"],
          totalCount: 2,
        }),
      );
    });

    it("should filter activities with and without category", async () => {
      const events = [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-04T09:00:00Z",
          task: "Task C",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.handle(
        EstimateQuery.create({ categories: ["", "Category A"] }),
      );

      expect(result).toEqual<EstimateQueryResult>(
        EstimateQueryResult.create({
          cycleTimes: [
            {
              cycleTime: 1,
              frequency: 2,
              probability: 1.0,
              cumulativeProbability: 1.0,
            },
          ],
          categories: ["", "Category A", "Category B"],
          totalCount: 2,
        }),
      );
    });

    it("should do not filter by category when an empty array is given", async () => {
      const events = [
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-03T09:00:00Z",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          timestamp: "2025-11-04T09:00:00Z",
          task: "Task C",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.handle(
        EstimateQuery.create({ categories: [] }),
      );

      expect(result).toEqual<EstimateQueryResult>(
        EstimateQueryResult.create({
          cycleTimes: [
            {
              cycleTime: 1,
              frequency: 3,
              probability: 1.0,
              cumulativeProbability: 1.0,
            },
          ],
          categories: ["", "Category A", "Category B"],
          totalCount: 3,
        }),
      );
    });
  });
});

function configure({ events }: { events: ActivityLoggedEvent[] }) {
  const eventStore = EventStore.createNull({ events });
  const clock = Clock.systemDefaultZone();
  const handler = EstimateQueryHandler.create({ eventStore, clock });
  return { handler };
}
