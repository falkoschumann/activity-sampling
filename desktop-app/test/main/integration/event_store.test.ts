// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { arrayFromAsync } from "../../../src/shared/common/polyfills";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-events.csv",
);

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/non_existing.csv",
);

describe("Event store", () => {
  it("should replay nothing when file does not exist", async () => {
    const store = EventStore.create({ fileName: NON_EXISTING_FILE });

    const events = await arrayFromAsync(store.replay());

    expect(events).toEqual([]);
  });

  it("should record and replay events", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ fileName: TEST_FILE });

    await store.record(ActivityLoggedEventDto.createTestInstance());
    const events = await arrayFromAsync(store.replay());

    expect(events).toEqual([ActivityLoggedEventDto.createTestInstance()]);
  });

  describe("Nullable", () => {
    it("should record a event", async () => {
      const store = EventStore.createNull();
      const recordEvents = store.trackRecorded();

      await store.record(ActivityLoggedEventDto.createTestInstance());

      expect(recordEvents.data).toEqual<ActivityLoggedEventDto[]>([
        ActivityLoggedEventDto.createTestInstance(),
      ]);
    });

    it("should replay events", async () => {
      const store = EventStore.createNull({
        events: [ActivityLoggedEventDto.createTestInstance()],
      });

      const events = await arrayFromAsync(store.replay());

      expect(events).toEqual([ActivityLoggedEventDto.createTestInstance()]);
    });
  });
});
