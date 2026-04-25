// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";
import { CategoriesProjection } from "../../../src/main/domain/categories_projection";

describe("Categories projection", () => {
  it("should return empty array when no event is logged", () => {
    const projection = CategoriesProjection.create();

    expect(projection.get()).toEqual([]);
  });

  it("should accumulate unique categories", () => {
    const projection = CategoriesProjection.create();

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
    const projection = CategoriesProjection.create();

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
