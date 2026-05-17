// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { UpdateSettingsCommand } from "../../../src/shared/domain/update_settings_command";

describe("Update settings", () => {
  it("should map command", () => {
    const query = UpdateSettingsCommand.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = UpdateSettingsCommand.create(dto);

    expect(model).toEqual(UpdateSettingsCommand.createTestInstance());
  });
});
