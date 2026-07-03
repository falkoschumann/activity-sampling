// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { StopTimerCommandHandler } from "../../../src/main/application/stop_timer.command_handler";
import { createStopTimerCommand } from "../../../src/shared/domain/timer/stop_timer.command";
import { createTimerStoppedEvent } from "../../../src/shared/domain/timer/timer_stopped.event";

describe("Stop timer", () => {
  it("should stop the timer", async () => {
    const { eventBus, handler } = configure();

    const status = await handler.handle(createStopTimerCommand());

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([createTimerStoppedEvent()]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const handler = StopTimerCommandHandler.create({ eventBus });
  return { eventBus, handler };
}
