// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs";

import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { createSuccess } from "../../src/main/common/messages";
import { arrayFromAsync } from "../../src/main/common/polyfills";
import { Clock } from "../../src/main/common/temporal";
import {
  createTestActivity,
  createTestLogActivityCommand,
} from "../../src/main/domain/activities";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../src/main/infrastructure/events";

describe("Activity Sampling - Acceptance Tests", () => {
  it("Should log activity", async () => {
    const { eventStore, service } = createSut();

    const status = await service.logActivity(
      createTestLogActivityCommand({
        timestamp: "2025-08-26T14:00:00Z",
      }),
    );

    expect(status).toEqual(createSuccess());
    const events = await arrayFromAsync(eventStore.replay());
    expect(events).toEqual([
      ActivityLoggedEvent.createTestData({
        timestamp: "2025-08-26T14:00:00Z",
      }),
    ]);
  });

  it("Should query recent activities", async () => {
    const { eventStore, service } = createSut();
    await eventStore.record(
      ActivityLoggedEvent.createTestData({ timestamp: "2025-08-26T14:00:00Z" }),
    );
    await eventStore.record(
      ActivityLoggedEvent.createTestData({ timestamp: "2025-08-26T13:30:00Z" }),
    );

    const result = await service.queryRecentActivities({});

    expect(result).toEqual({
      lastActivity: createTestActivity({ dateTime: "2025-08-26T16:00" }),
      workingDays: [
        {
          date: "2025-08-26",
          activities: [
            createTestActivity({ dateTime: "2025-08-26T16:00" }),
            createTestActivity({ dateTime: "2025-08-26T15:30" }),
          ],
        },
      ],
      timeSummary: {
        hoursToday: "PT1H",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT1H",
        hoursThisMonth: "PT1H",
      },
    });
  });
});

function createSut({ fileName = "testdata/acceptance_test.events.csv" } = {}) {
  fs.rmSync(fileName, { force: true });

  const clock = Clock.fixed("2025-08-26T14:00:00Z", "Europe/Berlin");
  const eventStore = EventStore.create({ fileName });
  const service = ActivitiesService.create({ eventStore, clock });
  return { eventStore, service };
}
