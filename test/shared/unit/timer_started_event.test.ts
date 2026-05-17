// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { TimerStartedEvent } from "../../../src/shared/domain/timer_started_event";

describe("Timer started event", () => {
  it("should map command", () => {
    const json = JSON.stringify(TimerStartedEvent.createTestInstance());
    const dto = JSON.parse(json);
    const model = TimerStartedEvent.create(dto);

    expect(model).toEqual(TimerStartedEvent.createTestInstance());
  });
});
