// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";

import {
  tickTimer,
  TickTimerCommand,
} from "../../shared/domain/timer/tick_timer.command";

export class TickTimerCommandHandler {
  static create({ eventBus }: { eventBus: EventBus }) {
    return new TickTimerCommandHandler(eventBus);
  }

  #eventBus;

  private constructor(eventBus: EventBus) {
    this.#eventBus = eventBus;
  }

  async handle(command: TickTimerCommand) {
    command = TickTimerCommand.create(command.data);
    const events = tickTimer(command);
    events.forEach((event) => this.#eventBus.publish(event));
    return new Success();
  }
}
