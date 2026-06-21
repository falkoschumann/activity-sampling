// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class TimerStoppedEvent {
  static create({ timer = "default" }: { timer?: string } = {}) {
    return new TimerStoppedEvent(timer);
  }

  readonly type = "timer-stopped";
  readonly data;

  private constructor(timer: string) {
    this.data = {
      timer,
    };
  }
}
