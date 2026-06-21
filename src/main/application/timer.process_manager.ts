// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type EventBus,
  MessageRouter,
  OutputTracker,
} from "@muspellheim/shared";

import { TickTimerCommand } from "../../shared/domain/timer/tick_timer.command";
import { TimerStartedEvent } from "../domain/timer/timer_started.event";
import { TimerStoppedEvent } from "../domain/timer/timer_stopped.event";
import { Clock, normalizeDuration } from "../../shared/domain/temporal";

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

  #interval!: Temporal.Duration;
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
    if (event instanceof TimerStartedEvent) {
      this.#timer.clearInterval(this.#progressTimerId);

      this.#interval = event.data.interval;
      this.#nextElapsedAt = this.#clock.instant().add(this.#interval);
      this.#progressTimerId = this.#timer.setInterval(() => this.#tick(), 1000);
      this.dispatchEvent(
        new CustomEvent("setTimers", { detail: { name: "progress" } }),
      );
    } else if (event instanceof TimerStoppedEvent) {
      this.#timer.clearInterval(this.#progressTimerId);
      this.dispatchEvent(
        new CustomEvent("cancelTimers", { detail: { name: "progress" } }),
      );
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

  #tick() {
    const start = this.#nextElapsedAt.subtract(this.#interval);
    const timestamp = this.#clock.instant();
    const progressedTime = normalizeDuration(start.until(timestamp));
    const command =
      Temporal.Duration.compare(progressedTime, this.#interval) < 0
        ? TickTimerCommand.create({
            progressedTime,
            duration: this.#interval,
          })
        : TickTimerCommand.create({
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
