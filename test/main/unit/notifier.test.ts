// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, type Message, MessageRouter } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { NotifierProcessManager } from "../../../src/main/application/notifier.process_manager";
import { LogActivityCommand } from "../../../src/shared/domain/logged-activity/log_activity.command";
import { TimerElapsedEvent } from "../../../src/main/domain/timer/timer_elapsed.event";
import { ActivityLoggedEvent } from "../../../src/main/domain/logged-activity/activity_logged.event";
import { NotificationsAdapter } from "../../../src/main/infrastructure/notifications_adapter";

describe("Notifier", () => {
  it("should notify without last activity", async () => {
    const { eventBus, notifications } = configure();
    const showTracked = notifications.trackShow();

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
    const { eventBus, notifications } = configure();
    const showTracked = notifications.trackShow();

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
    const { eventBus, messageRouter, notifications } = configure();
    const messages: Message[] = [];
    messageRouter.register("log-activity", (message) => messages.push(message));
    const showTracked = notifications.trackShow();
    eventBus.publish(
      TimerElapsedEvent.create({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    );
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notifications.simulateClick();

    expect(messages).toEqual([]);
  });

  it("should emit last activity when notification clicked", async () => {
    const { eventBus, messageRouter, notifications } = configure();
    const messages: Message[] = [];
    messageRouter.register("log-activity", (message) => messages.push(message));
    const showTracked = notifications.trackShow();
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
    await expect.poll(() => showTracked.data).toEqual([expect.anything()]);

    notifications.simulateClick();

    expect(messages).toEqual([
      LogActivityCommand.createTestInstance({
        client: "my-client",
        project: "my-project",
        task: "my-task",
      }),
    ]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const messageRouter = new MessageRouter();
  const notifications = NotificationsAdapter.createNull();
  NotifierProcessManager.create({ eventBus, messageRouter, notifications });
  return { eventBus, messageRouter, notifications };
}
