// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { OutputTracker } from "../common/output_tracker";

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
    NotificationStub.permission = "default";
    NotificationStub.expectedPermission = permission;
    return new NotificationClient(
      NotificationStub as unknown as typeof Notification,
    );
  }

  readonly #notificationConstructor: typeof Notification;
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

  show(title: string, options: NotificationOptions = {}, onClick?: () => void) {
    if (this.isGranted) {
      this.hide();
      this.#notification = new this.#notificationConstructor(title, options);
      this.#notification.onclick = () => {
        this.hide();
        onClick?.();
      };
      this.dispatchEvent(
        new CustomEvent(NOTIFICATION_SHOWN_EVENT, {
          detail: { title, ...options },
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
