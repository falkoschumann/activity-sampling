// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  SettingsQuery,
  SettingsQueryResult,
} from "../../../src/shared/domain/settings_query";

describe("Settings query", () => {
  it("should map query", () => {
    const query = SettingsQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = SettingsQuery.create(dto);

    expect(model).toEqual(SettingsQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const result = SettingsQueryResult.create();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = SettingsQueryResult.create(dto);

    expect(model).toEqual(SettingsQueryResult.create());
  });

  it("should map query result", () => {
    const result = SettingsQueryResult.createTestInstance();

    const json = JSON.stringify(result);
    const dto = JSON.parse(json);
    const model = SettingsQueryResult.create(dto);

    expect(model).toEqual(SettingsQueryResult.createTestInstance());
  });
});
