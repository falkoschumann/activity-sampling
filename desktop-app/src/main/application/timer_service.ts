// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, createSuccess } from "../common/messages";
import { Clock } from "../common/temporal";
import {
  type AskPeriodicallyCommand,
  TimerStartedEvent,
} from "../domain/timer";

export class TimerService extends EventTarget {
  static create({ clock = Clock.systemDefaultZone() } = {}): TimerService {
    return new TimerService(clock);
  }

  #clock: Clock;

  constructor(clock: Clock) {
    super();
    this.#clock = clock;
  }

  async askPeriodically(
    command: AskPeriodicallyCommand,
  ): Promise<CommandStatus> {
    this.dispatchEvent(
      new TimerStartedEvent(this.#clock.instant(), command.interval),
    );
    return createSuccess();
  }
}
