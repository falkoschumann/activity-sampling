// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { EventStore } from "../../../src/main/infrastructure/event_store";
import { ActivityLoggedEvent } from "../../../src/main/domain/activity_logged_event";

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-events.csv",
);

const MINIMAL_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/minimal.csv",
);

const FULL_FILE = path.resolve(import.meta.dirname, "../data/events/full.csv");

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/non_existing.csv",
);

const CORRUPT_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/corrupt.csv",
);

describe("Event store", () => {
  it("should replay minimal event", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ fileName: MINIMAL_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual<ActivityLoggedEvent[]>([
      ActivityLoggedEvent.createTestInstance(),
    ]);
  });

  it("should replay full event", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ fileName: FULL_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual<ActivityLoggedEvent[]>([
      {
        ...ActivityLoggedEvent.createTestInstance(),
        notes: "Test notes",
        category: "Test category",
      },
    ]);
  });

  it("should replay nothing when file does not exist", async () => {
    const store = EventStore.create({ fileName: NON_EXISTING_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual<ActivityLoggedEvent[]>([]);
  });

  it("should throw an error when file is corrupt", async () => {
    const store = EventStore.create({ fileName: CORRUPT_FILE });

    const events = Array.fromAsync(store.replay());

    await expect(events).rejects.toThrow(TypeError);
  });

  it("should record and replay events", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ fileName: TEST_FILE });

    await store.record(ActivityLoggedEvent.createTestInstance());
    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual<ActivityLoggedEvent[]>([
      ActivityLoggedEvent.createTestInstance(),
    ]);
  });

  describe("Nullable", () => {
    it("should record a event", async () => {
      const store = EventStore.createNull();
      const recordEvents = store.trackRecorded();

      await store.record(ActivityLoggedEvent.createTestInstance());

      expect(recordEvents.data).toEqual<ActivityLoggedEvent[]>([
        ActivityLoggedEvent.createTestInstance(),
      ]);
    });

    it("should replay events", async () => {
      const store = EventStore.createNull({
        events: [ActivityLoggedEvent.createTestInstance()],
      });

      const events = await Array.fromAsync(store.replay());

      expect(events).toEqual<ActivityLoggedEvent[]>([
        ActivityLoggedEvent.createTestInstance(),
      ]);
    });
  });
});
