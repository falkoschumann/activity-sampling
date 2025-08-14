// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../src/main/infrastructure/events";
import {
  createTestActivity,
  createTestLogActivityCommand,
} from "../../src/main/domain/activities";
import { createSuccess } from "../../src/main/common/messages";

describe("Activities service", () => {
  describe("Log activity", () => {
    describe("Log the activity with a client, a project, a task and an optional notes", () => {
      it("Logs without an optional notes", async () => {
        const eventStore = EventStore.createNull();
        const service = ActivitiesService.createNull({ eventStore });
        const recordEvents = eventStore.trackRecorded();

        const status = await service.logActivity(
          createTestLogActivityCommand(),
        );

        expect(status).toEqual(createSuccess());
        expect(recordEvents.data).toEqual([
          ActivityLoggedEvent.createTestData(),
        ]);
      });

      it("Logs with an optional notes", async () => {
        const eventStore = EventStore.createNull();
        const service = ActivitiesService.createNull({ eventStore });
        const recordEvents = eventStore.trackRecorded();

        const status = await service.logActivity(
          createTestLogActivityCommand({ notes: "Lorem ipsum" }),
        );

        expect(status).toEqual(createSuccess());
        expect(recordEvents.data).toEqual([
          ActivityLoggedEvent.createTestData({ notes: "Lorem ipsum" }),
        ]);
      });
    });
  });

  describe("Recent activities", () => {
    it("Return last activity", async () => {
      const eventStore = EventStore.createNull({
        events: [[ActivityLoggedEvent.createTestData()]],
      });
      const service = ActivitiesService.createNull({ eventStore });

      const result = await service.queryRecentActivities({});

      expect(result.lastActivity).toEqual(createTestActivity());
    });
  });
});
