// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  BurnUpQuery,
  BurnUpQueryResult,
} from "../../../src/shared/domain/burn_up_query";

describe("Burn-up query", () => {
  it("should map query", () => {
    const json = JSON.stringify(BurnUpQuery.createTestInstance());
    const dto = JSON.parse(json);
    const model = BurnUpQuery.create(dto);

    expect(model).toEqual(BurnUpQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const json = JSON.stringify(BurnUpQueryResult.create());
    const dto = JSON.parse(json);
    const model = BurnUpQueryResult.create(dto);

    expect(model).toEqual(BurnUpQueryResult.create());
  });

  it("should map query result", () => {
    const json = JSON.stringify(BurnUpQueryResult.createTestInstance());
    const dto = JSON.parse(json);
    const model = BurnUpQueryResult.create(dto);

    expect(model).toEqual(BurnUpQueryResult.createTestInstance());
  });
});
