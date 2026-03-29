// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  CurrentIntervalQuery,
  CurrentIntervalQueryResult,
} from "../../../src/shared/domain/current_interval_query";

describe("Current interval query", () => {
  it("should map query", () => {
    const query = CurrentIntervalQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = CurrentIntervalQuery.create(dto);

    expect(model).toEqual<CurrentIntervalQuery>(
      CurrentIntervalQuery.createTestInstance(),
    );
  });

  it("should map an empty query result", () => {
    const query = CurrentIntervalQueryResult.create();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = CurrentIntervalQueryResult.create(dto);

    expect(model).toEqual<CurrentIntervalQueryResult>(
      CurrentIntervalQueryResult.create(),
    );
  });

  it("should map query result", () => {
    const query = CurrentIntervalQueryResult.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = CurrentIntervalQueryResult.create(dto);

    expect(model).toEqual<CurrentIntervalQueryResult>(
      CurrentIntervalQueryResult.createTestInstance(),
    );
  });
});
