// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { StartTimerCommandHandler } from "../../../src/main/application/start_timer.command_handler";
import { StartTimerCommand } from "../../../src/shared/domain/timer/start_timer.command";
import { TimerStartedEvent } from "../../../src/main/domain/timer/timer_started.event";

describe("Start timer", () => {
  it("should start the timer", async () => {
    const eventBus = new EventBus();
    const handler = StartTimerCommandHandler.create({ eventBus });

    const status = await handler.handle(
      StartTimerCommand.create({ interval: "PT30M" }),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      TimerStartedEvent.create({ interval: "PT30M" }),
    ]);
  });
});
