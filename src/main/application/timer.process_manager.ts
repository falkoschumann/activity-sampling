// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type EventBus,
  MessageRouter,
  OutputTracker,
} from "@muspellheim/shared";

import { createTickTimerCommand } from "../../shared/domain/timer/tick_timer.command";
import type { TimerStartedEvent } from "../../shared/domain/timer/timer_started.event";
import type { TimerStoppedEvent } from "../../shared/domain/timer/timer_stopped.event";
import { normalizeDuration } from "../../shared/domain/value_objects/activity.value_object";
import { Clock } from "../infrastructure/clock";

export class TimerProcessManager extends EventTarget {
  static create({
    eventBus,
    messageRouter,
  }: {
    eventBus: EventBus;
    messageRouter: MessageRouter;
  }) {
    return new TimerProcessManager(
      eventBus,
      messageRouter,
      Clock.systemUtc(),
      globalThis,
    );
  }

  static createNull({
    eventBus,
    messageRouter,
    fixedInstant = "2026-06-12T10:00:00Z",
    timeZone = "Europe/Berlin",
  }: {
    eventBus: EventBus;
    messageRouter: MessageRouter;
    fixedInstant?: Temporal.InstantLike;
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new TimerProcessManager(
      eventBus,
      messageRouter,
      Clock.fixed(Temporal.Instant.from(fixedInstant), timeZone),
      new TimerStub() as unknown as typeof globalThis,
    );
  }

  #messageRouter;
  #clock;

  readonly #timer;
  #progressTimerId?: ReturnType<typeof setInterval>;

  #interval!: Temporal.DurationLike;
  #nextElapsedAt!: Temporal.Instant;

  private constructor(
    eventBus: EventBus,
    messageRouter: MessageRouter,
    clock: Clock,
    timer: typeof globalThis,
  ) {
    super();
    this.#messageRouter = messageRouter;
    this.#clock = clock;
    this.#timer = timer;

    eventBus.subscribe((event: TimerStartedEvent | TimerStoppedEvent) =>
      this.#react(event),
    );
  }

  async #react(event: TimerStartedEvent | TimerStoppedEvent) {
    switch (event.type) {
      case "timer-started":
        this.#handleTimerStarted(event);
        break;
      case "timer-stopped":
        this.#handleTimerStopped();
        break;
    }
  }

  trackSetTimers() {
    return OutputTracker.create(this, "setTimers");
  }

  trackCancelTimers() {
    return OutputTracker.create(this, "cancelTimers");
  }

  async simulateTick(duration: Temporal.DurationLike) {
    this.#clock = Clock.fixed(
      this.#clock.instant().add(duration),
      this.#clock.zone,
    );
    this.#tick();
  }

  #handleTimerStarted(event: TimerStartedEvent) {
    this.#timer.clearInterval(this.#progressTimerId);

    this.#interval = event.data.interval;
    this.#nextElapsedAt = this.#clock.instant().add(this.#interval);
    this.#progressTimerId = this.#timer.setInterval(() => this.#tick(), 1000);
    this.dispatchEvent(
      new CustomEvent("setTimers", { detail: { name: "progress" } }),
    );
  }

  #handleTimerStopped() {
    this.#timer.clearInterval(this.#progressTimerId);
    this.dispatchEvent(
      new CustomEvent("cancelTimers", { detail: { name: "progress" } }),
    );
  }

  #tick() {
    const start = this.#nextElapsedAt.subtract(this.#interval);
    const timestamp = this.#clock.instant().toString();
    const progressedTime = normalizeDuration(start.until(timestamp));
    const command =
      Temporal.Duration.compare(progressedTime, this.#interval) < 0
        ? createTickTimerCommand({
            progressedTime,
            duration: this.#interval,
          })
        : createTickTimerCommand({
            isElapsed: true,
            timestamp,
            duration: this.#interval,
          });
    this.#messageRouter.route(command);
  }
}

class TimerStub {
  setInterval() {}
  clearInterval() {}
}
