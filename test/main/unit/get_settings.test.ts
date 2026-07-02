// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetSettingsQueryHandler } from "../../../src/main/application/get_settings.query_handler";
import { createTestSettings } from "../../../src/shared/domain/settings/settings.aggregate";
import {
  GetSettingsQuery,
  GetSettingsQueryResult,
} from "../../../src/shared/domain/get_settings.query";

describe("Get settings", () => {
  it("should return stored settings", async () => {
    const handler = GetSettingsQueryHandler.createNull({
      settings: createTestSettings(),
    });

    const result = await handler.handle(GetSettingsQuery.create());

    expect(result).toEqual(GetSettingsQueryResult.createTestInstance());
  });
});
