// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventEmitter } from "node:events";

import { OutputTracker } from "@muspellheim/shared";
import { Notification } from "electron";

export class NotificationsGateway extends EventTarget {
  static create() {
    return new NotificationsGateway(Notification);
  }

  static createNull() {
    return new NotificationsGateway(
      NotificationStub as unknown as typeof Notification,
    );
  }

  readonly #notificationConstructor;
  #notification?: Notification;

  private constructor(notificationConstructor: typeof Notification) {
    super();
    this.#notificationConstructor = notificationConstructor;
  }

  async show({
    title,
    body,
    onClick,
  }: {
    title: string;
    body?: string;
    onClick?: () => void;
  }) {
    this.#notification = new this.#notificationConstructor({ title, body });
    if (onClick != null) {
      this.#notification.on("click", () => onClick());
    }
    this.#notification.show();
    this.dispatchEvent(new CustomEvent("show", { detail: { title, body } }));
  }

  trackShow() {
    return OutputTracker.create(this, "show");
  }

  async hide() {
    if (this.#notification == null) {
      return;
    }

    this.#notification.close();
    this.dispatchEvent(new CustomEvent("hide", { detail: "hidden" }));
  }

  trackHide() {
    return OutputTracker.create(this, "hide");
  }

  simulateClick() {
    this.#notification?.emit("click");
  }
}

class NotificationStub extends EventEmitter {
  show() {}
  close() {}
}
