// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import fsPromise from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { EventStore } from "../../../src/main/infrastructure/event_store";
import {
  type ActivityLoggedEventData,
  createActivityLoggedEvent,
} from "../../../src/shared/domain/activity/activity_logged.event";

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-events.csv",
);

const MINIMAL_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/minimal.csv",
);

const FULL_FILE = path.resolve(import.meta.dirname, "../data/events/full.csv");

const FILTER_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/filter.csv",
);

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/non_existing.csv",
);

const CORRUPT_FILE = path.resolve(
  import.meta.dirname,
  "../data/events/corrupt.csv",
);

const testLoggedEvent: ActivityLoggedEventData = {
  timestamp: "2025-08-14T11:00:00Z",
  duration: "PT30M",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  notification: "notifier",
};

describe("Event store", () => {
  it("should replay minimal event", async () => {
    const store = EventStore.create({ filename: MINIMAL_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual([createActivityLoggedEvent(testLoggedEvent)]);
  });

  it("should replay full event", async () => {
    const store = EventStore.create({ filename: FULL_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual([
      createActivityLoggedEvent({
        ...testLoggedEvent,
        notes: "Test notes",
        category: "Test category",
      }),
    ]);
  });

  it("should replay all events when filter is not set", async () => {
    const store = EventStore.create({ filename: FILTER_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual([
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-15T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-16T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-18T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-19T10:00:00Z",
      }),
    ]);
  });

  it("should replay filtered event with start", async () => {
    const store = EventStore.create({ filename: FILTER_FILE });

    const events = await Array.fromAsync(
      store.replay({ from: "2026-06-16T10:00:00Z" }),
    );

    expect(events).toEqual([
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-16T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-18T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-19T10:00:00Z",
      }),
    ]);
  });

  it("should replay filtered event with end", async () => {
    const store = EventStore.create({ filename: FILTER_FILE });

    const events = await Array.fromAsync(
      store.replay({ to: "2026-06-18T10:00:00Z" }),
    );

    expect(events).toEqual([
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-15T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-16T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-18T10:00:00Z",
      }),
    ]);
  });

  it("should replay filtered event with start and end", async () => {
    const store = EventStore.create({ filename: FILTER_FILE });

    const events = await Array.fromAsync(
      store.replay({
        from: "2026-06-16T10:00:00Z",
        to: "2026-06-18T10:00:00Z",
      }),
    );

    expect(events).toEqual([
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-16T10:00:00Z",
      }),
      createActivityLoggedEvent({
        ...testLoggedEvent,
        timestamp: "2026-06-18T10:00:00Z",
      }),
    ]);
  });

  it("should replay nothing when file does not exist", async () => {
    const store = EventStore.create({ filename: NON_EXISTING_FILE });

    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual([]);
  });

  it("should throw an error when file is corrupt", async () => {
    const store = EventStore.create({ filename: CORRUPT_FILE });

    const events = Array.fromAsync(store.replay());

    await expect(events).rejects.toThrow(TypeError);
  });

  it("should record and replay events", async () => {
    await fsPromise.rm(TEST_FILE, { force: true });
    const store = EventStore.create({ filename: TEST_FILE });

    await store.record(createActivityLoggedEvent(testLoggedEvent));
    const events = await Array.fromAsync(store.replay());

    expect(events).toEqual([createActivityLoggedEvent(testLoggedEvent)]);
  });

  describe("Nullable", () => {
    it("should record a event", async () => {
      const store = EventStore.createNull();
      const recordEvents = store.trackRecorded();

      await store.record(createActivityLoggedEvent(testLoggedEvent));

      expect(recordEvents.data).toEqual([
        createActivityLoggedEvent(testLoggedEvent),
      ]);
    });

    it("should replay events", async () => {
      const store = EventStore.createNull({
        events: [createActivityLoggedEvent(testLoggedEvent)],
      });

      const events = await Array.fromAsync(store.replay());

      expect(events).toEqual([createActivityLoggedEvent(testLoggedEvent)]);
    });
  });
});
