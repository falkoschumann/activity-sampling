// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  ReportQuery,
  ReportQueryResult,
} from "../../../src/shared/domain/report_query";

describe("Report query", () => {
  it("should map query", () => {
    const json = JSON.stringify(ReportQuery.createTestInstance());
    const dto = JSON.parse(json);
    const model = ReportQuery.create(dto);

    expect(model).toEqual(ReportQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const json = JSON.stringify(ReportQueryResult.create());
    const dto = JSON.parse(json);
    const model = ReportQueryResult.create(dto);

    expect(model).toEqual(ReportQueryResult.create());
  });

  it("should map query result", () => {
    const json = JSON.stringify(ReportQueryResult.createTestInstance());
    const dto = JSON.parse(json);
    const model = ReportQueryResult.create(dto);

    expect(model).toEqual(ReportQueryResult.createTestInstance());
  });
});
