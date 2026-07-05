// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetCurrentIntervalQueryHandler } from "../../../src/main/application/get_current_interval.query_handler";
import { createTimerStartedEvent } from "../../../src/shared/domain/timer/timer_started.event";
import { createTimerTickedEvent } from "../../../src/shared/domain/timer/timer_ticked.event";
import { createTimerElapsedEvent } from "../../../src/shared/domain/timer/timer_elapsed.event";
import { createTimerStoppedEvent } from "../../../src/shared/domain/timer/timer_stopped.event";
import {
  createTimer,
  projectTimer,
} from "../../../src/shared/domain/read_models/timer.read_model";
import {
  createGetCurrentIntervalQuery,
  createGetCurrentIntervalQueryResult,
} from "../../../src/shared/domain/read_models/get_current_interval.query";

describe("Get current interval", () => {
  it("should return empty result when view is initial state", async () => {
    const handler = GetCurrentIntervalQueryHandler.createNull();

    const result = await handler.handle(createGetCurrentIntervalQuery());

    expect(result).toEqual(createGetCurrentIntervalQueryResult());
  });

  it("should return started result when timer started ", async () => {
    const state = [createTimerStartedEvent({ interval: "PT15M" })].reduce(
      projectTimer,
      createTimer(),
    );
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(createGetCurrentIntervalQuery());

    expect(result).toEqual(
      createGetCurrentIntervalQueryResult({ isRunning: true }),
    );
  });

  it("should return ticked result when timer ticked ", async () => {
    const state = [
      createTimerStartedEvent({ interval: "PT20M" }),
      createTimerTickedEvent({
        progressedTime: "PT5M",
        duration: "PT20M",
      }),
    ].reduce(projectTimer, createTimer());
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(createGetCurrentIntervalQuery());

    expect(result).toEqual(
      createGetCurrentIntervalQueryResult({
        isRunning: true,
        elapsedTime: "PT5M",
        progress: 0.25,
      }),
    );
  });

  it("should return elapsed result when timer elapsed ", async () => {
    const state = [
      createTimerStartedEvent({ interval: "PT20M" }),
      createTimerElapsedEvent({
        timestamp: Temporal.Now.instant().toString(),
        duration: "PT20M",
      }),
    ].reduce(projectTimer, createTimer());
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(createGetCurrentIntervalQuery());

    expect(result).toEqual(
      createGetCurrentIntervalQueryResult({
        isRunning: true,
        elapsedTime: "PT0S",
        progress: 0,
      }),
    );
  });

  it("should return stopped result when timer stopped ", async () => {
    const state = [
      createTimerStartedEvent({ interval: "PT20M" }),
      createTimerTickedEvent({
        progressedTime: "PT15M",
        duration: "PT20M",
      }),
      createTimerStoppedEvent(),
    ].reduce(projectTimer, createTimer());
    const handler = GetCurrentIntervalQueryHandler.createNull({ state });

    const result = await handler.handle(createGetCurrentIntervalQuery());

    expect(result).toEqual(
      createGetCurrentIntervalQueryResult({
        isRunning: false,
        elapsedTime: "PT15M",
        progress: 0.75,
      }),
    );
  });
});
