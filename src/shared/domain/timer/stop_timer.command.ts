// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class StopTimerCommand {
  static create() {
    return new StopTimerCommand();
  }

  readonly type = "stop-timer";
  readonly data = null;

  private constructor() {}
}
