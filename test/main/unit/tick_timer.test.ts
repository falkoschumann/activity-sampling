// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { TickTimerCommandHandler } from "../../../src/main/application/tick_timer.command_handler";
import { TickTimerCommand } from "../../../src/shared/domain/timer/tick_timer.command";
import { TimerTickedEvent } from "../../../src/main/domain/timer/timer_ticked.event";
import { TimerElapsedEvent } from "../../../src/main/domain/timer/timer_elapsed.event";

describe("Tick timer", () => {
  it("should tick the timer", async () => {
    const eventBus = new EventBus();
    const handler = TickTimerCommandHandler.create({ eventBus });

    const status = await handler.handle(
      TickTimerCommand.create({ progressedTime: "PT5M", duration: "PT30M" }),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      TimerTickedEvent.create({ progressedTime: "PT5M", duration: "PT30M" }),
    ]);
  });

  it("should elapse the timer", async () => {
    const eventBus = new EventBus();
    const handler = TickTimerCommandHandler.create({ eventBus });

    const status = await handler.handle(
      TickTimerCommand.create({
        isElapsed: true,
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      TimerElapsedEvent.create({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    ]);
  });
});
