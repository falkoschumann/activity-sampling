// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { LogActivityCommand } from "../../../src/shared/domain/log_activity_command";

describe("Log activity command", () => {
  it("should map command", () => {
    const command = LogActivityCommand.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = LogActivityCommand.create(dto);

    expect(model).toEqual<LogActivityCommand>(
      LogActivityCommand.createTestInstance(),
    );
  });
});
