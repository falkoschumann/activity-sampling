// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../src/main/infrastructure/events";
import { arrayFromAsync } from "../../src/shared/common/polyfills";

const TEST_FILE = "testdata/event_store_test.csv";

describe("Event store", () => {
  it("Records and replays events", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ fileName: TEST_FILE });

    await store.record(ActivityLoggedEventDto.createTestInstance());
    const events = await arrayFromAsync(store.replay());

    expect(events).toEqual([ActivityLoggedEventDto.createTestInstance()]);
  });

  describe("Nulled event store", () => {
    it("Records a event", async () => {
      const store = EventStore.createNull();
      const recordEvents = store.trackRecorded();

      await store.record(ActivityLoggedEventDto.createTestInstance());

      expect(recordEvents.data).toEqual([
        ActivityLoggedEventDto.createTestInstance(),
      ]);
    });

    it("Replays events", async () => {
      const store = EventStore.createNull({
        events: [[ActivityLoggedEventDto.createTestInstance()]],
      });

      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([ActivityLoggedEventDto.createTestInstance()]);
    });
  });
});
