// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  BurnUpQuery,
  BurnUpQueryResult,
} from "../../../src/shared/domain/burn_up_query";

describe("Burn-up query", () => {
  it("should map query", () => {
    const query = BurnUpQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = BurnUpQuery.create(dto);

    expect(model).toEqual<BurnUpQuery>(BurnUpQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const query = BurnUpQueryResult.create();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = BurnUpQueryResult.create(dto);

    expect(model).toEqual<BurnUpQueryResult>(BurnUpQueryResult.create());
  });

  it("should map query result", () => {
    const query = BurnUpQueryResult.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = BurnUpQueryResult.create(dto);

    expect(model).toEqual<BurnUpQueryResult>(
      BurnUpQueryResult.createTestInstance(),
    );
  });
});
