// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventBus, MessageRouter } from "@muspellheim/shared";

import { LogActivityCommand } from "../../shared/domain/logged-activity/log_activity.command";
import { ActivityLoggedEvent } from "../domain/logged-activity/activity_logged.event";
import { TimerElapsedEvent } from "../domain/timer/timer_elapsed.event";
import { NotificationsGateway } from "../infrastructure/notifications.gateway";
import { Clock } from "../../shared/domain/temporal";

export class NotifierProcessManager {
  static create({
    eventBus,
    messageRouter,
    notificationsGateway,
    clock = Clock.systemUtc(),
  }: {
    eventBus: EventBus;
    messageRouter: MessageRouter;
    notificationsGateway: NotificationsGateway;
    clock?: Clock;
  }) {
    return new NotifierProcessManager(
      eventBus,
      messageRouter,
      notificationsGateway,
      clock,
    );
  }

  readonly #messageRouter;
  readonly #notificationsGateway;
  readonly #clock;

  #lastActivity?: ActivityLoggedEvent;
  #duration?: Temporal.Duration;

  private constructor(
    eventBus: EventBus,
    messageRouter: MessageRouter,
    notificationsGateway: NotificationsGateway,
    clock: Clock,
  ) {
    this.#messageRouter = messageRouter;
    this.#notificationsGateway = notificationsGateway;
    this.#clock = clock;

    eventBus.subscribe((event: ActivityLoggedEvent | TimerElapsedEvent) =>
      this.#react(event),
    );
  }

  async #react(event: ActivityLoggedEvent | TimerElapsedEvent) {
    switch (event.type) {
      case "activity-logged":
        this.#handleActivityLog(event);
        break;
      case "timer-elapsed":
        await this.#handleTimerElapsed(event);
        break;
    }
  }

  #handleActivityLog(event: ActivityLoggedEvent) {
    this.#lastActivity = event;
  }

  async #handleTimerElapsed(event: TimerElapsedEvent) {
    await this.#notificationsGateway.hide();

    this.#duration = event.data.duration;
    const title = "What are you working on?";
    let body;
    if (this.#lastActivity != null) {
      const { client, project, task } = this.#lastActivity.data;
      body = `${project} (${client}) ${task}`;
    }
    await this.#notificationsGateway.show({
      title,
      body,
      onClick: () => this.#emitLogActivity(),
    });
  }

  #emitLogActivity() {
    if (this.#lastActivity == null) {
      return;
    }

    this.#messageRouter.route(
      LogActivityCommand.create({
        ...this.#lastActivity.data,
        timestamp: this.#clock.instant(),
        duration: this.#duration ?? this.#lastActivity.data.duration,
      }),
    );
  }
}
