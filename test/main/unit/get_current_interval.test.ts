// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetCurrentIntervalQueryHandler } from "../../../src/main/application/get_current_interval.query_handler";
import {
  GetCurrentIntervalQuery,
  GetCurrentIntervalQueryResult,
} from "../../../src/shared/domain/get_current_interval.query";
import {
  createTimer,
  projectTimer,
} from "../../../src/shared/domain/timer.read_model";
import { TimerStartedEvent } from "../../../src/shared/domain/timer/timer_started.event";
import { TimerTickedEvent } from "../../../src/shared/domain/timer/timer_ticked.event";
import { TimerElapsedEvent } from "../../../src/shared/domain/timer/timer_elapsed.event";
import { TimerStoppedEvent } from "../../../src/shared/domain/timer/timer_stopped.event";

describe("Get current interval", () => {
  it("should return empty result when view is initial state", async () => {
    const handler = GetCurrentIntervalQueryHandler.createNull();

    const result = await handler.handle(GetCurrentIntervalQuery.create());

    expect(result).toEqual(GetCurrentIntervalQueryResult.create());
  });

  it("should return started result when timer started ", async () => {
    const state = [TimerStartedEvent.create({ interval: "PT15M" })].reduce(
      projectTimer,
      createTimer(),
    );
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(GetCurrentIntervalQuery.create());

    expect(result).toEqual(
      GetCurrentIntervalQueryResult.create({ isRunning: true }),
    );
  });

  it("should return ticked result when timer ticked ", async () => {
    const state = [
      TimerStartedEvent.create({ interval: "PT20M" }),
      TimerTickedEvent.create({
        progressedTime: Temporal.Duration.from("PT5M"),
        duration: Temporal.Duration.from("PT20M"),
      }),
    ].reduce(projectTimer, createTimer());
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(GetCurrentIntervalQuery.create());

    expect(result).toEqual(
      GetCurrentIntervalQueryResult.create({
        isRunning: true,
        elapsedTime: Temporal.Duration.from("PT5M"),
        progress: 0.25,
      }),
    );
  });

  it("should return elapsed result when timer elapsed ", async () => {
    const state = [
      TimerStartedEvent.create({ interval: "PT20M" }),
      TimerElapsedEvent.create({
        timestamp: Temporal.Now.instant(),
        duration: Temporal.Duration.from("PT20M"),
      }),
    ].reduce(projectTimer, createTimer());
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(GetCurrentIntervalQuery.create());

    expect(result).toEqual(
      GetCurrentIntervalQueryResult.create({
        isRunning: true,
        elapsedTime: Temporal.Duration.from("PT0S"),
        progress: 0,
      }),
    );
  });

  it("should return stopped result when timer stipped ", async () => {
    const state = [
      TimerStartedEvent.create({ interval: "PT20M" }),
      TimerTickedEvent.create({
        progressedTime: Temporal.Duration.from("PT15M"),
        duration: Temporal.Duration.from("PT20M"),
      }),
      TimerStoppedEvent.create(),
    ].reduce(projectTimer, createTimer());
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(GetCurrentIntervalQuery.create());

    expect(result).toEqual(
      GetCurrentIntervalQueryResult.create({
        isRunning: false,
        elapsedTime: Temporal.Duration.from("PT15M"),
        progress: 0.75,
      }),
    );
  });
});
