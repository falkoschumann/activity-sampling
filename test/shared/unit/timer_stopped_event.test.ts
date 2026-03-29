// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { TimerStoppedEvent } from "../../../src/shared/domain/timer_stopped_event";

describe("Timer stopped event", () => {
  it("should map command", () => {
    const command = TimerStoppedEvent.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = TimerStoppedEvent.create(dto);

    expect(model).toEqual<TimerStoppedEvent>(
      TimerStoppedEvent.createTestInstance(),
    );
  });
});
