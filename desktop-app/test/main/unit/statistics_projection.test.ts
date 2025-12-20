// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { projectStatistics } from "../../../src/main/domain/statistics_projection";
import {
  ActivityLoggedEvent,
  StatisticsQuery,
  StatisticsQueryResult,
  StatisticsScope,
} from "../../../src/shared/domain/activities";
import { createAsyncGenerator } from "../common/tools";

describe("Statistics projection", () => {
  describe("Working hours", () => {
    it("should return empty histogram when no activities are logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({
          scope: StatisticsScope.WORKING_HOURS,
        }),
      );

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: [],
          frequencies: [],
          xAxisLabel: "Duration (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 0,
          edge50: 0,
          edge75: 0,
          edge100: 0,
        },
        categories: [],
        totalCount: 0,
      });
    });

    it("should determine frequencies per bin with 3 tasks", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task C",
          duration: "PT16H", // 2 person days
          category: "Category 1",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({ scope: StatisticsScope.WORKING_HOURS }),
      );

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
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task C",
          duration: "PT32H", // 4 person days
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task D",
          duration: "PT4H", // 0.5 person days
          category: "Category 2",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({ scope: StatisticsScope.WORKING_HOURS }),
      );

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
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category 3",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task C",
          duration: "PT32H", // 4 person days
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task D",
          duration: "PT8H", // 1 person days
          category: "Category 3",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task E",
          duration: "PT16H", // 2 person days
          category: "Category 2",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({ scope: StatisticsScope.WORKING_HOURS }),
      );

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

    it("should filter by category when category is provided", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          task: "Task A",
          duration: "PT24H", // 3 person days
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task A",
          duration: "PT16H", // 2 person days
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task B",
          duration: "PT40H", // 5 person days
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          task: "Task C",
          duration: "PT16H", // 2 person days
          category: "Category A",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({
          scope: StatisticsScope.WORKING_HOURS,
          categories: ["Category A"],
        }),
      );

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
  });

  describe("Cycle times", () => {
    it("should return an empty result when no activities are logged", async () => {
      const replay = createAsyncGenerator([]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({ scope: StatisticsScope.CYCLE_TIMES }),
      );

      expect(result).toEqual<StatisticsQueryResult>({
        histogram: {
          binEdges: [],
          frequencies: [],
          xAxisLabel: "Cycle time (days)",
          yAxisLabel: "Number of Tasks",
        },
        median: {
          edge0: 0,
          edge25: 0,
          edge50: 0,
          edge75: 0,
          edge100: 0,
        },
        categories: [],
        totalCount: 0,
      });
    });

    it("should return statistics for cycle time", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-13T14:00",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-13T14:00",
          task: "Task B",
          category: "Category 2",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-15T14:00",
          task: "Task C",
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-16T14:00",
          task: "Task A",
          category: "Category 1",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-18T14:00",
          task: "Task B",
          category: "Category 2",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({ scope: StatisticsScope.CYCLE_TIMES }),
      );

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
        categories: ["Category 1", "Category 2"],
        totalCount: 3,
      });
    });

    it("should filter by category when category is provided", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-16T14:00",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-13T14:00",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-13T14:00",
          task: "Task B",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-13T16:00",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-15T14:00",
          task: "Task C",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-15T16:00",
          task: "Task C",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-08-18T14:00",
          task: "Task B",
          category: "Category A",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({
          scope: StatisticsScope.CYCLE_TIMES,
          categories: ["Category A"],
        }),
      );

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

    it("should filter by activities without a category", async () => {
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task B",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-04T10:00",
          task: "Task C",
          category: "Testing Category",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-05T10:00",
          task: "Task A",
          category: "Testing Category",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({
          scope: StatisticsScope.CYCLE_TIMES,
          categories: [""],
        }),
      );

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
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-04T10:00",
          task: "Task C",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({
          scope: StatisticsScope.CYCLE_TIMES,
          categories: ["", "Category A"],
        }),
      );

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
      const replay = createAsyncGenerator([
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task A",
          category: "Category A",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-03T10:00",
          task: "Task B",
          category: "Category B",
        }),
        ActivityLoggedEvent.createTestInstance({
          dateTime: "2025-11-04T10:00",
          task: "Task C",
        }),
      ]);

      const result = await projectStatistics(
        replay,
        StatisticsQuery.create({
          scope: StatisticsScope.CYCLE_TIMES,
          categories: [],
        }),
      );

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
