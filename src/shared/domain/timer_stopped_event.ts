// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export const TIMER_STOPPED_EVENT = "timerStopped";

export class TimerStoppedEvent extends Event {
  static create(_options = {}) {
    return new TimerStoppedEvent();
  }

  static createTestInstance() {
    return TimerStoppedEvent.create();
  }

  private constructor() {
    super(TIMER_STOPPED_EVENT);
  }
}
