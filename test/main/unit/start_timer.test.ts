// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, Success } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { StartTimerCommandHandler } from "../../../src/main/application/start_timer.command_handler";
import { createStartTimerCommand } from "../../../src/shared/domain/timer/start_timer.command";
import { createTimerStartedEvent } from "../../../src/shared/domain/timer/timer_started.event";

describe("Start timer", () => {
  it("should start the timer", async () => {
    const { handler, eventBus } = configure();

    const status = await handler.handle(
      createStartTimerCommand({ interval: "PT30M" }),
    );

    expect(status).toEqual(new Success());
    expect(eventBus.getEvents()).toEqual([
      createTimerStartedEvent({ interval: "PT30M" }),
    ]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const handler = StartTimerCommandHandler.create({ eventBus });
  return { handler, eventBus };
}
