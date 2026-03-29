// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Settings } from "../../../src/shared/domain/settings";

describe("Settings", () => {
  it("should map settings", () => {
    const command = Settings.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = Settings.create(dto);

    expect(model).toEqual<Settings>(Settings.createTestInstance());
  });
});
