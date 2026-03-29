// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  EstimateQuery,
  EstimateQueryResult,
} from "../../../src/shared/domain/estimate_query";

describe("Estimate query", () => {
  it("should map query", () => {
    const query = EstimateQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = EstimateQuery.create(dto);

    expect(model).toEqual<EstimateQuery>(EstimateQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const query = EstimateQueryResult.create();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = EstimateQueryResult.create(dto);

    expect(model).toEqual<EstimateQueryResult>(EstimateQueryResult.create());
  });

  it("should map query result", () => {
    const query = EstimateQueryResult.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = EstimateQueryResult.create(dto);

    expect(model).toEqual<EstimateQueryResult>(
      EstimateQueryResult.createTestInstance(),
    );
  });
});
