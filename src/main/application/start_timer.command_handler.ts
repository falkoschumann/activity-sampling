// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";

import {
  startTimer,
  type StartTimerCommand,
} from "../../shared/domain/timer/start_timer.command";

export class StartTimerCommandHandler {
  static create({ eventBus }: { eventBus: EventBus }) {
    return new StartTimerCommandHandler(eventBus);
  }

  #eventBus;

  private constructor(eventBus: EventBus) {
    this.#eventBus = eventBus;
  }

  async handle(command: StartTimerCommand) {
    const events = startTimer(command);
    events.forEach((event) => this.#eventBus.publish(event));
    return new Success();
  }
}
