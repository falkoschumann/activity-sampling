// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class StopTimerCommand {
  static create(_options?: never): StopTimerCommand {
    return new StopTimerCommand();
  }

  static createTestInstance(options?: never): StopTimerCommand {
    return StopTimerCommand.create(options);
  }
}
