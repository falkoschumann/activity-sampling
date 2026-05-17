// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { StopTimerCommand } from "../../../src/shared/domain/stop_timer_command";

describe("Stop timer command", () => {
  it("should map command", () => {
    const json = JSON.stringify(StopTimerCommand.createTestInstance());
    const dto = JSON.parse(json);
    const model = StopTimerCommand.create(dto);

    expect(model).toEqual(StopTimerCommand.createTestInstance());
  });
});
