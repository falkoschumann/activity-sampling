// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityLoggedEvent } from "../../shared/domain/activities";

interface NotificationClickedEventInit extends EventInit {
  activity?: ActivityLoggedEvent;
}

export class NotificationClickedEvent extends Event {
  static create(
    eventInitDict: NotificationClickedEventInit,
  ): NotificationClickedEvent {
    return new NotificationClickedEvent(
      NotificationClickedEvent.TYPE,
      eventInitDict,
    );
  }

  static TYPE = "notificationClicked";

  activity?: ActivityLoggedEvent;

  constructor(type: string, eventInitDict: NotificationClickedEventInit) {
    super(type);
    this.activity = eventInitDict.activity;
  }
}

export class NotificationGateway extends EventTarget {
  static #instance: NotificationGateway;

  static getInstance(): NotificationGateway {
    if (!NotificationGateway.#instance) {
      NotificationGateway.#instance = new NotificationGateway();
    }
    return NotificationGateway.#instance;
  }

  #notification?: Notification;

  #currentActivity?: ActivityLoggedEvent;

  setCurrentActivity(activity: ActivityLoggedEvent) {
    this.#currentActivity = activity;
  }

  show() {
    this.#notification = new Notification("What are you working on?", {
      body:
        this.#currentActivity != null
          ? `${this.#currentActivity.project} (${this.#currentActivity.client}) ${this.#currentActivity.task}`
          : undefined,
      requireInteraction: true,
      silent: false,
    });
    this.#notification.onclick = () =>
      this.dispatchEvent(
        NotificationClickedEvent.create({ activity: this.#currentActivity }),
      );
  }

  hide() {
    this.#notification?.close();
  }
}
