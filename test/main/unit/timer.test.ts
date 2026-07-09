// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { EventBus, MessageRouter, MessageTracker } from "@muspellheim/shared";
import { describe, expect, it } from "vitest";

import { TimerProcessManager } from "../../../src/main/application/timer.process_manager";
import { createTickTimerCommand } from "../../../src/shared/domain/timer/tick_timer.command";
import { createTimerStartedEvent } from "../../../src/shared/domain/timer/timer_started.event";
import { createTimerStoppedEvent } from "../../../src/shared/domain/timer/timer_stopped.event";

describe("Timer", () => {
  it("should start the timer", async () => {
    const { manager, eventBus } = configure();
    const setTimersTracked = manager.trackSetTimers();

    eventBus.publish(createTimerStartedEvent({ interval: "PT15M" }));

    await expect
      .poll(() => setTimersTracked.data)
      .toEqual([{ name: "progress" }]);
  });

  it("should stop the timer", async () => {
    const { manager, eventBus } = configure();
    eventBus.publish(createTimerStartedEvent({ interval: "PT20M" }));
    const cancelTimersTracked = manager.trackCancelTimers();

    eventBus.publish(createTimerStoppedEvent());

    await expect
      .poll(() => cancelTimersTracked.data)
      .toEqual([{ name: "progress" }]);
  });

  it("should tick the timer", async () => {
    const { manager, eventBus, messageRouter } = configure();
    eventBus.publish(createTimerStartedEvent({ interval: "PT30M" }));
    const messageTracker = MessageTracker.create(messageRouter, "tick-timer");

    await manager.simulateTick("PT10M");

    expect(messageTracker.messages).toEqual([
      createTickTimerCommand({ progressedTime: "PT10M", duration: "PT30M" }),
    ]);
  });

  it("should elapse the timer", async () => {
    const { manager, eventBus, messageRouter } = configure();
    eventBus.publish(createTimerStartedEvent({ interval: "PT30M" }));
    const messageTracker = MessageTracker.create(messageRouter, "tick-timer");

    await manager.simulateTick("PT30M");

    expect(messageTracker.messages).toEqual([
      createTickTimerCommand({
        isElapsed: true,
        duration: "PT30M",
      }),
    ]);
  });

  it("should reset elapsed timer", async () => {
    const { manager, eventBus, messageRouter } = configure();
    eventBus.publish(createTimerStartedEvent({ interval: "PT20M" }));
    const messageTracker = MessageTracker.create(messageRouter, "tick-timer");

    await manager.simulateTick("PT30M");
    await manager.simulateTick("PT1M");

    expect(messageTracker.messages).toEqual([
      createTickTimerCommand({
        isElapsed: true,
        duration: "PT20M",
      }),
      createTickTimerCommand({
        duration: "PT20M",
        progressedTime: "PT11M",
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
