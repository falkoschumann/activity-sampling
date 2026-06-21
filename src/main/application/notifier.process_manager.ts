// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventBus, MessageRouter } from "@muspellheim/shared";

import { LogActivityCommand } from "../../shared/domain/logged-activity/log_activity.command";
import { ActivityLoggedEvent } from "../domain/logged-activity/activity_logged.event";
import { TimerElapsedEvent } from "../domain/timer/timer_elapsed.event";
import { NotificationsAdapter } from "../infrastructure/notifications_adapter";

export class NotifierProcessManager {
  static create({
    eventBus,
    messageRouter,
    notifications,
  }: {
    eventBus: EventBus;
    messageRouter: MessageRouter;
    notifications: NotificationsAdapter;
  }) {
    return new NotifierProcessManager(eventBus, messageRouter, notifications);
  }

  readonly #messageRouter;
  readonly #notification;

  #lastActivity?: ActivityLoggedEvent;

  private constructor(
    eventBus: EventBus,
    messageRouter: MessageRouter,
    notification: NotificationsAdapter,
  ) {
    this.#messageRouter = messageRouter;
    this.#notification = notification;

    eventBus.subscribe((event: ActivityLoggedEvent | TimerElapsedEvent) =>
      this.#react(event),
    );
  }

  async #react(event: ActivityLoggedEvent | TimerElapsedEvent) {
    if (event instanceof ActivityLoggedEvent) {
      this.#lastActivity = event;
    } else if (event instanceof TimerElapsedEvent) {
      await this.#notification.hide();

      const title = "What are you working on?";
      let body;
      if (this.#lastActivity != null) {
        const { client, project, task } = this.#lastActivity.data;
        body = `${project} (${client}) ${task}`;
      }
      await this.#notification.show({
        title,
        body,
        onClick: () => this.#emitLogActivity(),
      });
    }
  }

  #emitLogActivity() {
    if (this.#lastActivity == null) {
      return;
    }

    this.#messageRouter.route(
      LogActivityCommand.create(this.#lastActivity.data),
    );
  }
}
