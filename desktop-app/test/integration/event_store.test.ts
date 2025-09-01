// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { EventStore } from "../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../src/main/infrastructure/events";
import { arrayFromAsync } from "../../src/main/common/polyfills";

const TEST_FILE = "testdata/event_store_test.csv";

describe("Event store", () => {
  it("Records and replays events", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ fileName: TEST_FILE });

    await store.record(ActivityLoggedEventDto.createTestData());
    const events = await arrayFromAsync(store.replay());

    expect(events).toEqual([ActivityLoggedEventDto.createTestData()]);
  });

  describe("Nulled event store", () => {
    it("Records a event", async () => {
      const store = EventStore.createNull();
      const recordEvents = store.trackRecorded();

      await store.record(ActivityLoggedEventDto.createTestData());

      expect(recordEvents.data).toEqual([
        ActivityLoggedEventDto.createTestData(),
      ]);
    });

    it("Replays events", async () => {
      const store = EventStore.createNull({
        events: [[ActivityLoggedEventDto.createTestData()]],
      });

      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([ActivityLoggedEventDto.createTestData()]);
    });
  });
});
