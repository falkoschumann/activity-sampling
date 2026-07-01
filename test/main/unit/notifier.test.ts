// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, MessageRouter, MessageTracker } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { NotifierProcessManager } from "../../../src/main/application/notifier.process_manager";
import { LogActivityCommand } from "../../../src/shared/domain/logged-activity/log_activity.command";
import { TimerElapsedEvent } from "../../../src/main/domain/timer/timer_elapsed.event";
import { ActivityLoggedEvent } from "../../../src/main/domain/logged-activity/activity_logged.event";
import { NotificationsGateway } from "../../../src/main/infrastructure/notifications.gateway";
import { Clock } from "../../../src/shared/domain/temporal";

describe("Notifier", () => {
  it("should notify without last activity", async () => {
    const { eventBus, notificationsGateway } = configure();
    const showTracked = notificationsGateway.trackShow();

    eventBus.publish(
      TimerElapsedEvent.create({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    );

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
      ActivityLoggedEvent.createTestInstance({
        client: "my-client",
        project: "my-project",
        task: "my-task",
      }),
    );
    eventBus.publish(
      TimerElapsedEvent.create({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    );

    await expect
      .poll(() => showTracked.data)
      .toEqual([
        {
          title: "What are you working on?",
          body: "my-project (my-client) my-task",
        },
      ]);
  });

  it("should do nothing when notification clicked and last activity does not exist", async () => {
    const { eventBus, messageRouter, notificationsGateway } = configure();
    const messageTracker = MessageTracker.create(messageRouter, "log-activity");
    const showTracked = notificationsGateway.trackShow();
    eventBus.publish(
      TimerElapsedEvent.create({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    );
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notificationsGateway.simulateClick();

    expect(messageTracker.messages).toEqual([]);
  });

  it("should emit last activity when notification clicked", async () => {
    const { eventBus, messageRouter, notificationsGateway, clock } =
      configure();
    const messageTracker = MessageTracker.create(messageRouter, "log-activity");
    const showTracked = notificationsGateway.trackShow();
    eventBus.publish(
      ActivityLoggedEvent.createTestInstance({
        client: "my-client",
        project: "my-project",
        task: "my-task",
        duration: "PT30M",
      }),
    );
    eventBus.publish(
      TimerElapsedEvent.create({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT20M",
      }),
    );
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notificationsGateway.simulateClick();

    expect(messageTracker.messages).toEqual([
      LogActivityCommand.createTestInstance({
        timestamp: clock.instant(),
        client: "my-client",
        project: "my-project",
        task: "my-task",
        duration: "PT20M",
      }),
    ]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const messageRouter = new MessageRouter();
  const notificationsGateway = NotificationsGateway.createNull();
  const clock = Clock.fixed("2026-06-13T11:00:00Z", "UTC");
  NotifierProcessManager.create({
    eventBus,
    messageRouter,
    notificationsGateway,
    clock,
  });
  return { eventBus, messageRouter, notificationsGateway, clock };
}
