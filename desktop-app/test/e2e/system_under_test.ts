// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import { expect } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import {
  type CommandStatus,
  createSuccess,
} from "../../src/main/common/messages";
import { arrayFromAsync } from "../../src/main/common/polyfills";
import { Clock } from "../../src/main/common/temporal";
import {
  createTestActivity,
  createTestLogActivityCommand,
  type RecentActivitiesQueryResult,
} from "../../src/main/domain/activities";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../src/main/infrastructure/events";

export class SystemUnderTest {
  readonly #fileName: string;
  readonly #eventStore: EventStore;
  readonly #activitiesService: ActivitiesService;

  #commandStatus?: CommandStatus;
  #recentActivitiesQueryResult?: RecentActivitiesQueryResult;

  constructor({ fileName = "testdata/acceptance_test.events.csv" } = {}) {
    this.#fileName = fileName;
    const clock = Clock.fixed("2025-08-26T14:00:00Z", "Europe/Berlin");
    const eventStore = (this.#eventStore = EventStore.create({ fileName }));
    this.#activitiesService = ActivitiesService.create({ eventStore, clock });
  }

  async start() {
    await fs.rm(this.#fileName, { force: true });
  }

  async logActivity({ timestamp }: { timestamp: string }) {
    const command = createTestLogActivityCommand({ timestamp });
    this.#commandStatus = await this.#activitiesService.logActivity(command);
  }

  async queryRecentActivities() {
    this.#recentActivitiesQueryResult =
      await this.#activitiesService.queryRecentActivities({});
  }

  assertRecentActivities({
    lastActivity,
    workingDays,
    timeSummary,
  }: {
    lastActivity: string;
    workingDays: { date: string; activities: string[] }[];
    timeSummary: {
      hoursToday: string;
      hoursYesterday: string;
      hoursThisWeek: string;
      hoursThisMonth: string;
    };
  }) {
    expect(this.#recentActivitiesQueryResult).toEqual({
      lastActivity: createTestActivity({ dateTime: lastActivity }),
      workingDays: workingDays.map((workingDay) => ({
        date: workingDay.date,
        activities: workingDay.activities.map((activity) =>
          createTestActivity({ dateTime: activity }),
        ),
      })),
      timeSummary,
    });
  }

  async activityLogged({ timestamp }: { timestamp: string }) {
    await this.#eventStore.record(
      ActivityLoggedEvent.createTestData({ timestamp }),
    );
  }

  async assertActivityLogged({ timestamp }: { timestamp: string }) {
    expect(this.#commandStatus).toEqual(createSuccess());
    const events = await arrayFromAsync(this.#eventStore.replay());
    expect(events).toEqual([ActivityLoggedEvent.createTestData({ timestamp })]);
  }
}
