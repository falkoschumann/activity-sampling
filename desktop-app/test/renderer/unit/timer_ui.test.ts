// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  initialState,
  intervalElapsed,
  reducer,
  type State,
  timerStarted,
  timerStopped,
  timerTicked,
} from "../../../src/renderer/domain/timer";

describe("Timer UI", () => {
  it("should handle timer started", () => {
    let state: State = initialState;

    state = reducer(state, timerStarted({ interval: "PT20M" }));

    expect(state).toEqual({
      ...initialState,
      interval: "PT20M",
      remaining: "PT20M",
      percentage: 0,
    } as State);
  });

  it("should handle timer ticked", () => {
    let state: State = {
      ...initialState,
      interval: "PT20M",
      remaining: "PT15M",
      percentage: 25,
    };

    state = reducer(state, timerTicked({ duration: "PT1M" }));

    expect(state).toEqual({
      ...initialState,
      interval: "PT20M",
      remaining: "PT14M",
      percentage: 30,
    } as State);
  });

  it("should handle timer stopped", () => {
    let state: State = {
      ...initialState,
      interval: "PT20M",
      remaining: "PT15M",
      percentage: 25,
    };

    state = reducer(state, timerStopped());

    expect(state).toEqual({
      ...initialState,
      interval: "PT20M",
      remaining: "PT15M",
      percentage: 25,
    } as State);
  });

  it("should handle interval elapsed", () => {
    let state: State = {
      ...initialState,
      interval: "PT20M",
      remaining: "PT0S",
      percentage: 100,
    };

    state = reducer(
      state,
      intervalElapsed({ timestamp: "2025-09-09T17:27:00Z", interval: "PT20M" }),
    );

    expect(state).toEqual({
      ...initialState,
      interval: "PT20M",
      remaining: "PT20M",
      percentage: 0,
    } as State);
  });
});
