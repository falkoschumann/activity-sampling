// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, MessageRouter, MessageTracker } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { NotifierProcessManager } from "../../../src/main/application/notifier.process_manager";
import { createLogActivityCommand } from "../../../src/shared/domain/activity/log_activity.command";
import { createTimerElapsedEvent } from "../../../src/shared/domain/timer/timer_elapsed.event";
import {
  type ActivityLoggedEvent,
  type ActivityLoggedEventData,
  createActivityLoggedEvent,
} from "../../../src/shared/domain/activity/activity_logged.event";
import { NotificationsGateway } from "../../../src/main/infrastructure/notifications.gateway";
import { Clock } from "../../../src/main/infrastructure/clock";
import { EventStore } from "../../../src/main/infrastructure/event_store";

const testActivity: ActivityLoggedEventData = {
  timestamp: "2025-08-14T11:00:00Z",
  duration: "PT30M",
  client: "Test client",
  project: "Test project",
  task: "Test task",
  notification: "notifier",
};

describe("Notifier", () => {
  it("should notify without last activity", async () => {
    const { eventBus, notificationsGateway } = configure({ events: [] });
    const showTracked = notificationsGateway.trackShow();

    eventBus.publish(createTimerElapsedEvent({ duration: "PT30M" }));

    await expect
      .poll(() => showTracked.data)
      .toEqual([
        {
          title: "What are you working on?",
        },
      ]);
  });

  it("should notify with last activity", async () => {
    const { eventBus, notificationsGateway } = configure();
    const showTracked = notificationsGateway.trackShow();

    eventBus.publish(
      createActivityLoggedEvent({
        ...testActivity,
        client: "Test client",
        project: "Test project",
        task: "Test task",
      }),
    );
    eventBus.publish(createTimerElapsedEvent({ duration: "PT30M" }));

    await expect
      .poll(() => showTracked.data)
      .toEqual([
        {
          title: "What are you working on?",
          body: "Test project (Test client) Test task",
        },
      ]);
  });

  it("should do nothing when notification clicked and last activity does not exist", async () => {
    const { eventBus, messageRouter, notificationsGateway } = configure({
      events: [],
    });
    const messageTracker = MessageTracker.create(messageRouter, "log-activity");
    const showTracked = notificationsGateway.trackShow();
    eventBus.publish(createTimerElapsedEvent({ duration: "PT30M" }));
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notificationsGateway.simulateClick();

    expect(messageTracker.messages).toEqual([]);
  });

  it("should emit last logged activity when notification clicked", async () => {
    const { eventBus, messageRouter, notificationsGateway, clock } =
      configure();
    const messageTracker = MessageTracker.create(messageRouter, "log-activity");
    const showTracked = notificationsGateway.trackShow();
    eventBus.publish(
      createActivityLoggedEvent({
        ...testActivity,
        client: "Test client",
        project: "Test project",
        task: "Test task",
        duration: "PT30M",
      }),
    );
    eventBus.publish(createTimerElapsedEvent({ duration: "PT20M" }));
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notificationsGateway.simulateClick();

    expect(messageTracker.messages).toEqual([
      createLogActivityCommand({
        timestamp: clock.instant(),
        client: "Test client",
        project: "Test project",
        task: "Test task",
        duration: "PT20M",
      }),
    ]);
  });

  it("should emit last stored activity when notification clicked", async () => {
    const { eventBus, messageRouter, notificationsGateway, clock } = configure({
      events: [
        createActivityLoggedEvent({
          ...testActivity,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          duration: "PT30M",
        }),
      ],
    });
    const messageTracker = MessageTracker.create(messageRouter, "log-activity");
    const showTracked = notificationsGateway.trackShow();
    eventBus.publish(createTimerElapsedEvent({ duration: "PT20M" }));
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notificationsGateway.simulateClick();

    expect(messageTracker.messages).toEqual([
      createLogActivityCommand({
        timestamp: clock.instant(),
        client: "Test client",
        project: "Test project",
        task: "Test task",
        duration: "PT20M",
      }),
    ]);
  });
});

function configure({
  events,
}: { events?: ActivityLoggedEvent[] | undefined } = {}) {
  const eventStore = EventStore.createNull({ events });
  const eventBus = new EventBus();
  const messageRouter = new MessageRouter();
  const notificationsGateway = NotificationsGateway.createNull();
  const clock = Clock.fixed("2026-06-13T11:00:00Z", "UTC");
  NotifierProcessManager.create({
    eventStore,
    eventBus,
    messageRouter,
    notificationsGateway,
    clock,
  });
  return { eventStore, eventBus, messageRouter, notificationsGateway, clock };
}
