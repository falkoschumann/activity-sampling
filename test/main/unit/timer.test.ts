// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, type Message, MessageRouter } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { TimerProcessManager } from "../../../src/main/application/timer.process_manager";
import { TickTimerCommand } from "../../../src/shared/domain/timer/tick_timer.command";
import { TimerStartedEvent } from "../../../src/main/domain/timer/timer_started.event";
import { TimerStoppedEvent } from "../../../src/main/domain/timer/timer_stopped.event";

describe("Timer", () => {
  it("should start the timer", async () => {
    const { manager, eventBus } = configure();
    const setTimersTracked = manager.trackSetTimers();

    eventBus.publish(TimerStartedEvent.create({ interval: "PT15M" }));

    await expect
      .poll(() => setTimersTracked.data)
      .toEqual([{ name: "progress" }]);
  });

  it("should stop the timer", async () => {
    const { manager, eventBus } = configure();
    eventBus.publish(TimerStartedEvent.create({ interval: "PT20M" }));
    const cancelTimersTracked = manager.trackCancelTimers();

    eventBus.publish(TimerStoppedEvent.create());

    await expect
      .poll(() => cancelTimersTracked.data)
      .toEqual([{ name: "progress" }]);
  });

  it("should tick the timer", async () => {
    const { manager, eventBus, messageRouter } = configure();
    eventBus.publish(TimerStartedEvent.create({ interval: "PT30M" }));
    const messages: Message[] = [];
    messageRouter.register("tick-timer", (message) => messages.push(message));

    await manager.simulateTick("PT10M");

    expect(messages).toEqual([
      TickTimerCommand.create({ progressedTime: "PT10M", duration: "PT30M" }),
    ]);
  });

  it("should elapse the timer", async () => {
    const { manager, eventBus, messageRouter } = configure();
    eventBus.publish(TimerStartedEvent.create({ interval: "PT30M" }));
    const messages: Message[] = [];
    messageRouter.register("tick-timer", (message) => messages.push(message));

    await manager.simulateTick("PT30M");

    expect(messages).toEqual([
      TickTimerCommand.create({
        isElapsed: true,
        duration: "PT30M",
        timestamp: "2026-06-12T10:30:00Z",
      }),
    ]);
  });
});

function configure() {
  const eventBus = new EventBus();
  const messageRouter = new MessageRouter();
  const manager = TimerProcessManager.createNull({
    eventBus,
    messageRouter,
  });
  return { manager, eventBus, messageRouter };
}
