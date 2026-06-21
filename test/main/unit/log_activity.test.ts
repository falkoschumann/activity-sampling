// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { LogActivityCommandHandler } from "../../../src/main/application/log_activity.command_handler";
import { LogActivityCommand } from "../../../src/shared/domain/logged-activity/log_activity.command";
import { ActivityLoggedEvent } from "../../../src/main/domain/logged-activity/activity_logged.event";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Log activity", () => {
  describe("Log the activity with a client, a project, a task and with optional notes or category", () => {
    it("should log only with required fields", async () => {
      const { handler, eventBus, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await handler.handle(
        LogActivityCommand.createTestInstance(),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(eventBus.getEvents()).toEqual([
        ActivityLoggedEvent.createTestInstance(),
      ]);
      expect(recordEvents.data).toEqual([
        ActivityLoggedEvent.createTestInstance(),
      ]);
    });

    it("should log with all optional fields", async () => {
      const { handler, eventBus, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await handler.handle(
        LogActivityCommand.createTestInstance({
          notes: "my notes",
          category: "my category",
        }),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(eventBus.getEvents()).toEqual([
        ActivityLoggedEvent.createTestInstance({
          notes: "my notes",
          category: "my category",
        }),
      ]);
      expect(recordEvents.data).toEqual([
        ActivityLoggedEvent.createTestInstance({
          notes: "my notes",
          category: "my category",
        }),
      ]);
    });
  });
});

function configure({
  events,
}: {
  events?: ActivityLoggedEvent[];
} = {}) {
  const eventBus = new EventBus();
  const eventStore = EventStore.createNull({ events });
  const handler = LogActivityCommandHandler.create({ eventBus, eventStore });
  return { handler, eventBus, eventStore };
}
