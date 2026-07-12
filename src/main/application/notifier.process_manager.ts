// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { EventBus, MessageRouter } from "@muspellheim/shared";

import { createLogActivityCommand } from "../../shared/domain/activity/log_activity.command";
import type { ActivityLoggedEvent } from "../../shared/domain/activity/activity_logged.event";
import type { TimerElapsedEvent } from "../../shared/domain/timer/timer_elapsed.event";
import { Clock } from "../infrastructure/clock";
import { NotificationsGateway } from "../infrastructure/notifications.gateway";
import type { EventStore } from "../infrastructure/event_store";

export class NotifierProcessManager {
  static create({
    eventStore,
    eventBus,
    messageRouter,
    notificationsGateway,
    clock = Clock.systemUtc(),
  }: {
    eventStore: EventStore;
    eventBus: EventBus;
    messageRouter: MessageRouter;
    notificationsGateway: NotificationsGateway;
    clock?: Clock;
  }) {
    return new NotifierProcessManager(
      eventStore,
      eventBus,
      messageRouter,
      notificationsGateway,
      clock,
    );
  }

  readonly #eventStore;
  readonly #messageRouter;
  readonly #notificationsGateway;
  readonly #clock;

  #lastActivity?: ActivityLoggedEvent;
  #duration?: Temporal.DurationLike;

  private constructor(
    eventStore: EventStore,
    eventBus: EventBus,
    messageRouter: MessageRouter,
    notificationsGateway: NotificationsGateway,
    clock: Clock,
  ) {
    this.#eventStore = eventStore;
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

    if (this.#lastActivity == null) {
      const events = this.#eventStore.replay();
      let lastActivity;
      for await (const event of events) {
        lastActivity = event;
      }
      if (lastActivity != null) {
        this.#lastActivity = lastActivity;
      }
    }

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
      createLogActivityCommand({
        ...this.#lastActivity.data,
        timestamp: this.#clock.instant(),
        duration: this.#duration ?? this.#lastActivity.data.duration,
      }),
    );
  }
}
