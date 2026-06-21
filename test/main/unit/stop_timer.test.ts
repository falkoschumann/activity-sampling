// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { StopTimerCommandHandler } from "../../../src/main/application/stop_timer.command_handler";
import { StopTimerCommand } from "../../../src/shared/domain/timer/stop_timer.command";
import { TimerStoppedEvent } from "../../../src/main/domain/timer/timer_stopped.event";

describe("Stop timer", () => {
  it("should stop the timer", async () => {
    const eventBus = new EventBus();
    const handler = StopTimerCommandHandler.create({ eventBus });

    const status = await handler.handle(StopTimerCommand.create());

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([TimerStoppedEvent.create()]);
  });
});
