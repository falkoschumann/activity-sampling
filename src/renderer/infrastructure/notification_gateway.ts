// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { LoggedActivity } from "../../shared/domain/logged_activity";

interface NotificationClickedEventInit extends EventInit {
  activity?: LoggedActivity;
}

export class NotificationClickedEvent extends Event {
  static create(
    eventInitDict: NotificationClickedEventInit,
  ): NotificationClickedEvent {
    return new NotificationClickedEvent("notificationClicked", eventInitDict);
  }

  activity?: LoggedActivity;

  constructor(type: string, eventInitDict: NotificationClickedEventInit) {
    super(type);
    this.activity = eventInitDict.activity;
  }
}

type EventMap = {
  notificationClicked: NotificationClickedEvent;
};

export class NotificationGateway extends EventTarget {
  static #instance: NotificationGateway;

  static getInstance(): NotificationGateway {
    if (!NotificationGateway.#instance) {
      NotificationGateway.#instance = new NotificationGateway();
    }
    return NotificationGateway.#instance;
  }

  #notification?: Notification;

  #currentActivity?: LoggedActivity;

  setCurrentActivity(activity: LoggedActivity) {
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

  override addEventListener<K extends keyof EventMap>(
    type: K,
    callback: (event: EventMap[K]) => void,
    options?: AddEventListenerOptions | boolean,
  ) {
    super.addEventListener(type, callback, options);
  }

  override removeEventListener<K extends keyof EventMap>(
    type: K,
    callback: (event: EventMap[K]) => void,
    options?: EventListenerOptions | boolean,
  ) {
    super.removeEventListener(type, callback, options);
  }
}
