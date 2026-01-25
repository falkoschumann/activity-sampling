// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import { queryStatistics } from "../../../src/main/application/statistics_query_handler";
import {
  Histogram,
  Median,
  type StatisticsQuery,
  StatisticsQueryResult,
  StatisticsScope,
} from "../../../src/shared/domain/statistics_query";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Statistics", () => {
  describe("Create histogram for hours worked on tasks", () => {
    it("should return empty histogram when no activities are logged", async () => {
      const { queryStatistics } = configure({ events: [] });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result.histogram).toEqual<Histogram>({
        binEdges: [],
        frequencies: [],
        xAxisLabel: "Duration (days)",
        yAxisLabel: "Number of Tasks",
      });
    });

    it("should return histogram for working hours", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-10-13T11:00:00Z",
          task: "Task A",
          duration: "PT24H",
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-10-14T13:00:00Z",
          task: "Task B",
          duration: "PT40H",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-10-15T13:00:00Z",
          task: "Task C",
          duration: "PT40H",
          category: "Category 2",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result.histogram).toEqual<Histogram>({
        binEdges: ["0", "0.5", "1", "2", "3", "5"],
        frequencies: [0, 0, 0, 1, 2],
        xAxisLabel: "Duration (days)",
        yAxisLabel: "Number of Tasks",
      });
    });

    it("should determine frequencies per bin with 3 tasks", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task C",
          duration: "PT16H", // 2 person days
          category: "Category 1",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "0.5", "1", "2", "3", "5"],
          frequencies: [0, 0, 1, 1, 1],
          xAxisLabel: "Duration (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 2,
          edge50: 3,
          edge75: 4,
          edge100: 5,
        },
        categories: ["Category 1", "Category 2"],
        totalCount: 3,
      });
    });

    it("should determine frequencies per bin with even number of tasks", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task C",
          duration: "PT32H", // 4 person days
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task D",
          duration: "PT4H", // 0.5 person days
          category: "Category 2",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "0.5", "1", "2", "3", "5"],
          frequencies: [1, 0, 0, 1, 2],
          xAxisLabel: "Duration (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 0.5,
          edge50: 3.5,
          edge75: 4,
          edge100: 5,
        },
        categories: ["Category 1", "Category 2"],
        totalCount: 4,
      });
    });

    it("should determine frequencies per bin with odd number of tasks", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category 3",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task C",
          duration: "PT32H", // 4 person days
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task D",
          duration: "PT8H", // 1 person days
          category: "Category 3",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task E",
          duration: "PT16H", // 2 person days
          category: "Category 2",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "0.5", "1", "2", "3", "5"],
          frequencies: [0, 1, 1, 1, 2],
          xAxisLabel: "Duration (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 1.5,
          edge50: 3,
          edge75: 3.5,
          edge100: 5,
        },
        categories: ["Category 1", "Category 2", "Category 3"],
        totalCount: 5,
      });
    });
  });

  describe("Create histogram for cycle times", () => {
    it("should return an empty histogram when no activities are logged", async () => {
      const { queryStatistics } = configure({ events: [] });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
      });

      expect(result.histogram).toEqual<Histogram>({
        binEdges: [],
        frequencies: [],
        xAxisLabel: "Cycle time (days)",
        yAxisLabel: "Number of Tasks",
      });
    });

    it("should return histogram for cycle time", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T12:00:00Z",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T12:00:00Z",
          task: "Task B",
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-15T12:00:00Z",
          task: "Task C",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-16T12:00:00Z",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-18T12:00:00Z",
          task: "Task B",
          category: "Category 2",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
      });

      expect(result.histogram).toEqual<Histogram>({
        binEdges: ["0", "1", "2", "3", "5", "8"],
        frequencies: [1, 0, 0, 1, 1],
        xAxisLabel: "Cycle time (days)",
        yAxisLabel: "Number of Tasks",
      });
    });

    it("should filter by category when category is provided", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-16T12:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T12:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T12:00:00Z",
          task: "Task B",
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T14:00:00Z",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-15T12:00:00Z",
          task: "Task C",
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-15T14:00:00Z",
          task: "Task C",
          category: "Category B",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-18T12:00:00Z",
          task: "Task B",
          category: "Category A",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
        categories: ["Category A"],
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "1", "2", "3", "5", "8"],
          frequencies: [1, 0, 0, 1, 1],
          xAxisLabel: "Cycle time (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 1,
          edge50: 4,
          edge75: 5,
          edge100: 6,
        },
        categories: ["Category A", "Category B"],
        totalCount: 3,
      });
    });
  });

  describe("Determine median for hours worked on tasks", () => {
    it("should return empty histogram when no activities are logged", async () => {
      const { queryStatistics } = configure({ events: [] });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result.median).toEqual<Median>({
        edge0: 0,
        edge25: 0,
        edge50: 0,
        edge75: 0,
        edge100: 0,
      });
    });

    it("should return median for working hours", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-10-13T11:00:00Z",
          task: "Task A",
          duration: "PT24H",
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-10-14T13:00:00Z",
          task: "Task B",
          duration: "PT40H",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-10-15T13:00:00Z",
          task: "Task C",
          duration: "PT40H",
          category: "Category 2",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
      });

      expect(result.median).toEqual<Median>({
        edge0: 0,
        edge25: 3,
        edge50: 5,
        edge75: 5,
        edge100: 5,
      });
    });
  });

  describe("Determine median for cycle times", () => {
    it("should return an empty histogram when no activities are logged", async () => {
      const { queryStatistics } = configure({ events: [] });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
      });

      expect(result.median).toEqual<Median>({
        edge0: 0,
        edge25: 0,
        edge50: 0,
        edge75: 0,
        edge100: 0,
      });
    });

    it("should return median for cycle time", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T12:00:00Z",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-13T12:00:00Z",
          task: "Task B",
          category: "Category 2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-15T12:00:00Z",
          task: "Task C",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-16T12:00:00Z",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-08-18T12:00:00Z",
          task: "Task B",
          category: "Category 2",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
      });

      expect(result.median).toEqual<Median>({
        edge0: 0,
        edge25: 1,
        edge50: 4,
        edge75: 5,
        edge100: 6,
      });
    });
  });

  describe("Filter statistic data by category", () => {
    it("should filter by category when category is provided", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task A",
          duration: "PT16H", // 2 person days
          category: "Category B",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          task: "Task C",
          duration: "PT16H", // 2 person days
          category: "Category A",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.WORKING_HOURS,
        categories: ["Category A"],
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "0.5", "1", "2", "3", "5"],
          frequencies: [0, 0, 1, 1, 1],
          xAxisLabel: "Duration (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 2,
          edge50: 3,
          edge75: 4,
          edge100: 5,
        },
        categories: ["Category A", "Category B"],
        totalCount: 3,
      });
    });

    it("should filter by activities without a category", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-03T08:00:00Z",
          task: "Task A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-03T08:00:00Z",
          task: "Task B",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-04T08:00:00Z",
          task: "Task C",
          category: "Testing Category",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-05T08:00:00Z",
          task: "Task A",
          category: "Testing Category",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
        categories: [""],
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "1", "2"],
          frequencies: [2, 0],
          xAxisLabel: "Cycle time (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 1,
          edge50: 1,
          edge75: 1,
          edge100: 1,
        },
        categories: ["", "Testing Category"],
        totalCount: 2,
      });
    });

    it("should filter by no category and a category", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-03T08:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-03T08:00:00Z",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-04T08:00:00Z",
          task: "Task C",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
        categories: ["", "Category A"],
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "1", "2"],
          frequencies: [2, 0],
          xAxisLabel: "Cycle time (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 1,
          edge50: 1,
          edge75: 1,
          edge100: 1,
        },
        categories: ["", "Category A", "Category B"],
        totalCount: 2,
      });
    });

    it("should do not filter when query categories is an empty array", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-03T08:00:00Z",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-03T08:00:00Z",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-11-04T08:00:00Z",
          task: "Task C",
        }),
      ];
      const { queryStatistics } = configure({ events });

      const result = await queryStatistics({
        scope: StatisticsScope.CYCLE_TIMES,
        categories: [],
      });

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: ["0", "1", "2"],
          frequencies: [3, 0],
          xAxisLabel: "Cycle time (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 1,
          edge50: 1,
          edge75: 1,
          edge100: 1,
        },
        categories: ["", "Category A", "Category B"],
        totalCount: 3,
      });
    });
  });
});

function configure({ events }: { events?: ActivityLoggedEventDto[] }) {
  const eventStore = EventStore.createNull({ events });
  const clock = Clock.fixed("1970-01-01T00:00:00Z", "Europe/Berlin");
  return {
    queryStatistics: (query: StatisticsQuery) =>
      queryStatistics(query, eventStore, clock),
  };
}
