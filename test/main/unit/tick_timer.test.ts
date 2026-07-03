// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { TickTimerCommandHandler } from "../../../src/main/application/tick_timer.command_handler";
import { createTickTimerCommand } from "../../../src/shared/domain/timer/tick_timer.command";
import { createTimerElapsedEvent } from "../../../src/shared/domain/timer/timer_elapsed.event";
import { createTimerTickedEvent } from "../../../src/shared/domain/timer/timer_ticked.event";

describe("Tick timer", () => {
  it("should tick the timer", async () => {
    const { eventBus, handler } = configure();

    const status = await handler.handle(
      createTickTimerCommand({ progressedTime: "PT5M", duration: "PT30M" }),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      createTimerTickedEvent({ progressedTime: "PT5M", duration: "PT30M" }),
    ]);
  });

  it("should elapse the timer", async () => {
    const { eventBus, handler } = configure();

    const status = await handler.handle(
      createTickTimerCommand({
        isElapsed: true,
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      createTimerElapsedEvent({
        timestamp: "2026-06-13T11:00:00Z",
        duration: "PT30M",
      }),
    ]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const handler = TickTimerCommandHandler.create({ eventBus });
  return { eventBus, handler };
}
