// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { projectEstimate } from "../../../src/main/domain/estimate_projection";
import {
  ActivityLoggedEvent,
  EstimateQuery,
  EstimateQueryResult,
} from "../../../src/shared/domain/activities";

describe("Estimate projection", () => {
  it("should return an empty result when no activities are logged", async () => {
    const replay = createAsyncGenerator([]);

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({}),
    });

    expect(result).toEqual<EstimateQueryResult>({
      cycleTimes: [],
      categories: [],
      totalCount: 0,
    });
  });

  it("should calculate the probability of cycle times", async () => {
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task A",
        category: "Category 3",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task B",
        category: "Category 2",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task C",
        category: "Category 1",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-04T10:00",
        task: "Task C",
        category: "Category 1",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-05T10:00",
        task: "Task D",
        category: "Category 3",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task D",
        category: "Category 3",
      }),
    ]);

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({}),
    });

    expect(result).toEqual<EstimateQueryResult>({
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
    });
  });

  it("should join the cycle time of an activity with multiple categories", async () => {
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task A",
        category: "Category 1",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task B",
        category: "Category 2",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-04T10:00",
        task: "Task A",
        category: "Category 2",
      }),
    ]);

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({}),
    });

    expect(result).toEqual<EstimateQueryResult>({
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
    });
  });

  it("should filter by category when category is provided", async () => {
    const replay = createAsyncGenerator([
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task A",
        category: "Category A",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-03T10:00",
        task: "Task B",
        category: "Category A",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-04T10:00",
        task: "Task C",
        category: "Category B",
      }),
      ActivityLoggedEvent.createTestInstance({
        dateTime: "2025-11-05T10:00",
        task: "Task A",
        category: "Category B",
      }),
    ]);

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({ categories: ["Category A"] }),
    });

    expect(result).toEqual<EstimateQueryResult>({
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

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({ categories: [""] }),
    });

    expect(result).toEqual<EstimateQueryResult>({
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

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({ categories: ["", "Category A"] }),
    });

    expect(result).toEqual<EstimateQueryResult>({
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

    const result = await projectEstimate({
      replay,
      query: EstimateQuery.create({ categories: [] }),
    });

    expect(result).toEqual<EstimateQueryResult>({
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
    });
  });
});

// TODO extract helper functions

async function* createAsyncGenerator<T>(array: T[]) {
  for (const element of array) {
    yield element;
  }
}
