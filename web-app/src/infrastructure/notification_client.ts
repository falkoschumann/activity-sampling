// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { OutputTracker } from "../util/output_tracker";

const NOTIFICATION_SHOWN_EVENT = "NOTIFICATION_SHOWN";
const NOTIFICATION_HIDDEN_EVENT = "NOTIFICATION_HIDDEN";

export class NotificationClient extends EventTarget {
  static create() {
    return new NotificationClient(window.Notification);
  }

  static createNull(
    {
      permission,
    }: {
      permission: NotificationPermission;
    } = { permission: "granted" },
  ) {
    return new NotificationClient(createNotificationStub(permission));
  }

  readonly #notificationConstructor;
  #notification?: Notification;

  constructor(notificationConstructor: typeof Notification) {
    super();
    this.#notificationConstructor = notificationConstructor;
  }

  get isGranted() {
    return this.#notificationConstructor.permission === "granted";
  }

  get isDenied() {
    return this.#notificationConstructor.permission === "denied";
  }

  get isUnknown() {
    return this.#notificationConstructor.permission === "default";
  }

  async requestPermission() {
    if (!this.isDenied) {
      await this.#notificationConstructor.requestPermission();
    }
  }

  show(title: string, body?: string, iconUrl?: string) {
    if (this.isGranted) {
      this.hide();
      this.#notification = new this.#notificationConstructor(title, {
        body,
        icon: iconUrl,
      });
      this.dispatchEvent(
        new CustomEvent(NOTIFICATION_SHOWN_EVENT, {
          detail: {
            title,
            body,
          },
        }),
      );
    }
  }

  trackNotificationsShown() {
    return OutputTracker.create(this, NOTIFICATION_SHOWN_EVENT);
  }

  hide() {
    if (this.#notification == null) {
      return;
    }

    this.#notification.close();
    this.dispatchEvent(
      new CustomEvent(NOTIFICATION_HIDDEN_EVENT, {
        detail: {
          title: this.#notification.title,
          body: this.#notification.body,
        },
      }),
    );
    this.#notification = undefined;
  }

  trackNotificationsHidden() {
    return OutputTracker.create(this, NOTIFICATION_HIDDEN_EVENT);
  }
}

function createNotificationStub(permission: NotificationPermission) {
  NotificationStub.permission = "default";
  NotificationStub.expectedPermission = permission;

  return NotificationStub as unknown as typeof Notification;
}

class NotificationStub {
  static expectedPermission: NotificationPermission;
  static permission = "default";

  static requestPermission() {
    return (this.permission = this.expectedPermission);
  }

  title: string;
  body?: string;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.body = options?.body;
  }

  close() {}
}
