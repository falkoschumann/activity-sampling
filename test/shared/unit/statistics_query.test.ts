// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  StatisticsQuery,
  StatisticsQueryResult,
} from "../../../src/shared/domain/statistics_query";

describe("Statistics query", () => {
  it("should map query", () => {
    const json = JSON.stringify(StatisticsQuery.createTestInstance());
    const dto = JSON.parse(json);
    const model = StatisticsQuery.create(dto);

    expect(model).toEqual<StatisticsQuery>(
      StatisticsQuery.createTestInstance(),
    );
  });

  it("should map an empty query result", () => {
    const json = JSON.stringify(StatisticsQueryResult.create());
    const dto = JSON.parse(json);
    const model = StatisticsQueryResult.create(dto);

    expect(model).toEqual<StatisticsQueryResult>(
      StatisticsQueryResult.create(),
    );
  });

  it("should map query result", () => {
    const json = JSON.stringify(StatisticsQueryResult.createTestInstance());
    const dto = JSON.parse(json);
    const model = StatisticsQueryResult.create(dto);

    expect(model).toEqual<StatisticsQueryResult>(
      StatisticsQueryResult.createTestInstance(),
    );
  });
});
