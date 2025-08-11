// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { ActivitiesService } from "../../src/main/application/activities_service";
import { createTestLogActivityCommand } from "../../src/shared/domain/activities";
import { createSuccess } from "../../src/shared/domain/messages";
import { EventStore } from "../../src/main/infrastructure/event_store";
import { createTestActivityLoggedEvent } from "../../src/main/infrastructure/events";

describe("Activities service", () => {
  describe("Log activity", () => {
    it("Log the activity with client, project and task", async () => {
      const eventStore = EventStore.createNull();
      const service = ActivitiesService.createNull({ eventStore });
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(createTestLogActivityCommand());

      expect(status).toEqual(createSuccess());
      expect(recordEvents.data).toEqual([createTestActivityLoggedEvent()]);
    });

    it("Log the activity with client, project, task and optional notes", async () => {
      const eventStore = EventStore.createNull();
      const service = ActivitiesService.createNull({ eventStore });
      const recordEvents = eventStore.trackRecorded();

      const status = await service.logActivity(
        createTestLogActivityCommand({ notes: "Lorem ipsum" }),
      );

      expect(status).toEqual(createSuccess());
      expect(recordEvents.data).toEqual([
        createTestActivityLoggedEvent({ notes: "Lorem ipsum" }),
      ]);
    });
  });
});
