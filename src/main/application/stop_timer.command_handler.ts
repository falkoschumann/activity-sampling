// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";

import {
  stopTimer,
  type StopTimerCommand,
} from "../../shared/domain/timer/stop_timer.command";

export class StopTimerCommandHandler {
  static create({ eventBus }: { eventBus: EventBus }) {
    return new StopTimerCommandHandler(eventBus);
  }

  #eventBus;

  private constructor(eventBus: EventBus) {
    this.#eventBus = eventBus;
  }

  async handle(command: StopTimerCommand) {
    const events = stopTimer(command);
    events.forEach((event) => this.#eventBus.publish(event));
    return new Success();
  }
}
