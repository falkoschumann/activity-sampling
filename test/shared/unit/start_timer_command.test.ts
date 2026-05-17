// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { StartTimerCommand } from "../../../src/shared/domain/start_timer_command";

describe("Start timer command", () => {
  it("should map command", () => {
    const json = JSON.stringify(StartTimerCommand.createTestInstance());
    const dto = JSON.parse(json);
    const model = StartTimerCommand.create(dto);

    expect(model).toEqual(StartTimerCommand.createTestInstance());
  });
});
