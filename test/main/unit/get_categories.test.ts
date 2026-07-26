// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetCategoriesQueryHandler } from "../../../src/main/application/get_categories.query_handler";
import {
  type ActivityLoggedEvent,
  type ActivityLoggedEventData,
  createActivityLoggedEvent,
} from "../../../src/shared/domain/activity/activity_logged.event";
import {
  createGetCategoriesQuery,
  createGetCategoriesQueryResult,
} from "../../../src/shared/domain/read_models/get_categories.query";
import { EventStore } from "../../../src/main/infrastructure/event_store";

const testActivity: ActivityLoggedEventData = {
  timestamp: "2025-08-14T11:00:00Z",
  duration: "PT30M",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  notification: "notifier",
};

describe("Get categories", () => {
  it("should return no categories when no activity is logged", async () => {
    const { handler } = configure({ events: [] });

    const result = await handler.handle(createGetCategoriesQuery());

    expect(result.categories).toEqual<string[]>([]);
  });

  it("should filter by categories", async () => {
    const events = [
      createActivityLoggedEvent({
        ...testActivity,
        timestamp: "2021-10-12T16:00:00Z",
        task: "task-1",
        category: "category-1",
      }),
      createActivityLoggedEvent({
        ...testActivity,
        timestamp: "2021-10-13T16:00:00Z",
        task: "task-2",
        category: "category-2",
      }),
      createActivityLoggedEvent({
        ...testActivity,
        timestamp: "2021-10-14T16:00:00Z",
        task: "task-1",
        category: "category-2",
      }),
    ];
    const { handler } = configure({ events });

    const result = await handler.handle(createGetCategoriesQuery());

    expect(result).toEqual(
      createGetCategoriesQueryResult({
        categories: ["category-1", "category-2"],
      }),
    );
  });
});

function configure({ events }: { events: ActivityLoggedEvent[] }) {
  const eventStore = EventStore.createNull({ events });
  const handler = GetCategoriesQueryHandler.create({ eventStore });
  return { handler };
}
