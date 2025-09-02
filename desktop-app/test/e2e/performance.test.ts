// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, it } from "vitest";

import { arrayFromAsync } from "../../src/shared/common/polyfills";
import { ActivitiesService } from "../../src/main/application/activities_service";
import { EventStore } from "../../src/main/infrastructure/event_store";

const isPerformance = process.env.TEST_PERFORMANCE === "true";

describe.runIf(isPerformance)("Performance", () => {
  it("Replays events", async () => {
    const eventStore = EventStore.create({ fileName: "data/events.csv" });

    const events = await arrayFromAsync(eventStore.replay());

    console.info("Replayed events, number of events", events.length);
  }, 60_000_000);

  it("Queries recent activities", async () => {
    const eventStore = EventStore.create({ fileName: "data/events.csv" });
    const service = ActivitiesService.create({ eventStore });

    const result = await service.queryRecentActivities({});

    console.info(
      "Recent activities queried, last activity",
      result.lastActivity,
      "time summary",
      result.timeSummary,
    );
  }, 60_000_000);
});
