// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import { EventStore } from "../../src/main/infrastructure/event_store";

describe("Event store", () => {
  it("Records a event", async () => {
    const store = EventStore.createNull();
    const recordEvents = store.trackRecorded();

    await store.record({ type: "answer", data: 42 });

    expect(recordEvents.data).toEqual([{ type: "answer", data: 42 }]);
  });

  it("Replays events", async () => {
    const store = EventStore.createNull({
      events: [[{ type: "answer", data: 42 }]],
    });

    const events = await store.replay();

    expect(events).toEqual([{ type: "answer", data: 42 }]);
  });
});
