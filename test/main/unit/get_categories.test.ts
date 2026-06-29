// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { GetCategoriesQueryHandler } from "../../../src/main/application/get_categories.query_handler";
import { createSettings } from "../../../src/main/domain/settings/settings.aggregate";
import {
  GetCategoriesQuery,
  GetCategoriesQueryResult,
} from "../../../src/shared/domain/get_categories.query";

describe("Get categories", () => {
  it("should return stored settings", async () => {
    const handler = GetCategoriesQueryHandler.createNull({
      settings: createSettings({
        categories: ["", "Feature", "Rework", "Training"],
      }),
    });

    const result = await handler.handle(GetCategoriesQuery.create());

    expect(result).toEqual(
      GetCategoriesQueryResult.create({
        categories: ["", "Feature", "Rework", "Training"],
      }),
    );
  });
});
