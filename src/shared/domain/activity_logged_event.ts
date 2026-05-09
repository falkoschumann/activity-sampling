// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export const ACTIVITY_LOGGED_EVENT = "activityLogged";

export class ActivityLoggedEvent extends Event {
  static create() {
    return new ActivityLoggedEvent();
  }

  static createTestInstance() {
    return ActivityLoggedEvent.create();
  }

  private constructor() {
    super(ACTIVITY_LOGGED_EVENT);
  }
}
