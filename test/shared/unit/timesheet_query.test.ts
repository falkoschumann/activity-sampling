// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../../src/shared/domain/timesheet_query";

describe("Timesheet query", () => {
  it("should map query", () => {
    const query = TimesheetQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = TimesheetQuery.create(dto);

    expect(model).toEqual<TimesheetQuery>(TimesheetQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const query = TimesheetQueryResult.create();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = TimesheetQueryResult.create(dto);

    expect(model).toEqual<TimesheetQueryResult>(TimesheetQueryResult.create());
  });

  it("should map query result", () => {
    const query = TimesheetQueryResult.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = TimesheetQueryResult.create(dto);

    expect(model).toEqual<TimesheetQueryResult>(
      TimesheetQueryResult.createTestInstance(),
    );
  });
});
