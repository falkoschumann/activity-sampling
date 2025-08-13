// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { EventStore } from "../../src/main/infrastructure/event_store";
import { createTestActivityLoggedEvent } from "../../src/main/infrastructure/events";

describe("Event store", () => {
  it("Records and replays events", async () => {
    const store = EventStore.create();

    await store.record(createTestActivityLoggedEvent);
    const events = await store.replay();

    expect(events).toEqual([createTestActivityLoggedEvent]);
  });

  describe("Nulled event store", () => {
    it("Records a event", async () => {
      const store = EventStore.createNull();
      const recordEvents = store.trackRecorded();

      await store.record(createTestActivityLoggedEvent);

      expect(recordEvents.data).toEqual([createTestActivityLoggedEvent]);
    });

    it("Replays events", async () => {
      const store = EventStore.createNull({
        events: [[createTestActivityLoggedEvent]],
      });

      const events = await store.replay();

      expect(events).toEqual([createTestActivityLoggedEvent]);
    });
  });
});
