// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { StopTimerCommand } from "../../../src/shared/domain/stop_timer_command";

describe("Stop timer command", () => {
  it("should map command", () => {
    const command = StopTimerCommand.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = StopTimerCommand.create(dto);

    expect(model).toEqual<StopTimerCommand>(
      StopTimerCommand.createTestInstance(),
    );
  });
});
