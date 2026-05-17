// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../../src/shared/domain/timesheet_query";

describe("Timesheet query", () => {
  it("should map query", () => {
    const json = JSON.stringify(TimesheetQuery.createTestInstance());
    const dto = JSON.parse(json);
    const model = TimesheetQuery.create(dto);

    expect(model).toEqual<TimesheetQuery>(TimesheetQuery.createTestInstance());
  });

  it("should map an empty query result", () => {
    const json = JSON.stringify(TimesheetQueryResult.create());
    const dto = JSON.parse(json);
    const model = TimesheetQueryResult.create(dto);

    expect(model).toEqual<TimesheetQueryResult>(TimesheetQueryResult.create());
  });

  it("should map query result", () => {
    const json = JSON.stringify(TimesheetQueryResult.createTestInstance());
    const dto = JSON.parse(json);
    const model = TimesheetQueryResult.create(dto);

    expect(model).toEqual<TimesheetQueryResult>(
      TimesheetQueryResult.createTestInstance(),
    );
  });
});
