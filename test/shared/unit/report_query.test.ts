// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  ReportQuery,
  ReportQueryResult,
} from "../../../src/shared/domain/report_query";

describe("Report query", () => {
  it("should map query", () => {
    const query = ReportQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = ReportQuery.create(dto);

    expect(model).toEqual<ReportQuery>(ReportQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const query = ReportQueryResult.create();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = ReportQueryResult.create(dto);

    expect(model).toEqual<ReportQueryResult>(ReportQueryResult.create());
  });

  it("should map query result", () => {
    const query = ReportQueryResult.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = ReportQueryResult.create(dto);

    expect(model).toEqual<ReportQueryResult>(
      ReportQueryResult.createTestInstance(),
    );
  });
});
