// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { LogActivityCommandHandler } from "../../../src/main/application/log_activity_command_handler";
import { LogActivityCommand } from "../../../src/shared/domain/log_activity_command";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Log activity", () => {
  describe("Log the activity with a client, a project, a task and with optional notes or category", () => {
    it("should log only with required fields", async () => {
      const { handler, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await handler.handle(
        LogActivityCommand.createTestInstance(),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(recordEvents.data).toEqual<ActivityLoggedEvent[]>([
        ActivityLoggedEvent.createTestInstance(),
      ]);
    });

    it("should log with all optional fields", async () => {
      const { handler, eventStore } = configure();
      const recordEvents = eventStore.trackRecorded();

      const status = await handler.handle(
        LogActivityCommand.createTestInstance({
          notes: "my notes",
          category: "my category",
        }),
      );

      expect(status).toEqual<CommandStatus>(new Success());
      expect(recordEvents.data).toEqual<ActivityLoggedEvent[]>([
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
  const eventStore = EventStore.createNull({ events });
  const handler = LogActivityCommandHandler.create({ eventStore });
  return { handler, eventStore };
}
