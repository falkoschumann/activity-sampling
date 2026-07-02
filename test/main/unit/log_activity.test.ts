// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { LogActivityCommandHandler } from "../../../src/main/application/log_activity.command_handler";
import { createLogActivityCommand } from "../../../src/shared/domain/activity/log_activity.command";
import {
  type ActivityLoggedEvent,
  type ActivityLoggedEventData,
  createActivityLoggedEvent,
} from "../../../src/shared/domain/activity/activity_logged.event";
import { EventStore } from "../../../src/main/infrastructure/event_store";

const minimalActivity: ActivityLoggedEventData = {
  timestamp: "2026-01-01T12:00:00Z",
  duration: "PT1H",
  client: "my client",
  project: "my project",
  task: "my task",
  notification: "notifier",
};

const fullActivity: ActivityLoggedEventData = {
  ...minimalActivity,
  notes: "my notes",
  category: "my category",
};

describe("Log activity", () => {
  it("should log only with required fields", async () => {
    const { handler, eventBus, eventStore } = configure();
    const recordEvents = eventStore.trackRecorded();

    const status = await handler.handle(
      createLogActivityCommand(minimalActivity),
    );

    expect(status).toEqual<CommandStatus>(new Success());
    expect(eventBus.getEvents()).toEqual([
      createActivityLoggedEvent(minimalActivity),
    ]);
    expect(recordEvents.data).toEqual([
      createActivityLoggedEvent(minimalActivity),
    ]);
  });

  it("should log with all optional fields", async () => {
    const { handler, eventBus, eventStore } = configure();
    const recordEvents = eventStore.trackRecorded();

    const status = await handler.handle(createLogActivityCommand(fullActivity));

    expect(status).toEqual<CommandStatus>(new Success());
    expect(eventBus.getEvents()).toEqual([
      createActivityLoggedEvent(fullActivity),
    ]);
    expect(recordEvents.data).toEqual([
      createActivityLoggedEvent(fullActivity),
    ]);
  });

  it("should normalize timestamp and duration", async () => {
    const { handler, eventBus, eventStore } = configure();
    const recordEvents = eventStore.trackRecorded();

    const status = await handler.handle(
      createLogActivityCommand({
        ...minimalActivity,
        timestamp: "2026-01-01T12:13:14.123456789Z",
        duration: "PT1H30M15.123456789S",
      }),
    );

    expect(status).toEqual<CommandStatus>(new Success());
    expect(eventBus.getEvents()).toEqual([
      createActivityLoggedEvent({
        ...minimalActivity,
        timestamp: "2026-01-01T12:13:14Z",
        duration: "PT1H30M",
      }),
    ]);
    expect(recordEvents.data).toEqual([
      createActivityLoggedEvent({
        ...minimalActivity,
        timestamp: "2026-01-01T12:13:14Z",
        duration: "PT1H30M",
      }),
    ]);
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
