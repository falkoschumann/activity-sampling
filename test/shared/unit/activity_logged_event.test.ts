// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { LoggedActivity } from "../../../src/shared/domain/logged_activity";

describe("Activity logged event", () => {
  it("should map command", () => {
    const command = LoggedActivity.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = LoggedActivity.create(dto);

    expect(model).toEqual<LoggedActivity>(LoggedActivity.createTestInstance());
  });
});
