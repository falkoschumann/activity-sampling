// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { OutputTracker } from "../util/output_tracker";

export class NotificationClient extends EventTarget {
  static create() {
    return new NotificationClient(window.Notification);
  }

  static createNull() {
    return new NotificationClient(NotificationStub);
  }

  readonly #notificationType;
  #notification?: NotificationStub;

  constructor(notificationType: typeof NotificationStub) {
    super();
    this.#notificationType = notificationType;
  }

  get isGranted() {
    return this.#notificationType.permission === "granted";
  }

  get isDenied() {
    return this.#notificationType.permission === "denied";
  }

  get isUnknown() {
    return this.#notificationType.permission === "default";
  }

  async requestPermission() {
    if (!this.isDenied) {
      await this.#notificationType.requestPermission();
    }
  }

  show(title: string, body?: string, iconUrl?: string) {
    if (this.isGranted) {
      this.#notification?.close();
      this.#notification = new this.#notificationType(title, {
        body,
        icon: iconUrl,
      });
      this.dispatchEvent(
        new CustomEvent("NOTIFICATION_SHOWN", {
          detail: {
            title,
            body,
          },
        }),
      );
    }
  }

  trackNotificationsShown() {
    return OutputTracker.create(this, "NOTIFICATION_SHOWN");
  }

  hide() {
    this.#notification?.close();
  }
}

class NotificationStub {
  static permission: NotificationPermission = "default";

  static async requestPermission() {
    return (NotificationStub.permission = "granted");
  }

  constructor(_title: string, _options?: NotificationOptions) {}

  close() {}
}
