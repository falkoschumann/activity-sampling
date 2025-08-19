// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import { Calendar } from "../../src/main/domain/calendar";

describe("Calendar", () => {
  it("Determines business days", () => {
    const calendar = Calendar.create();

    const businessDays = calendar.countBusinessDays("2025-06-01", "2025-07-01");

    expect(businessDays).toEqual(21);
  });

  it("Determines business days with holidays", () => {
    const calendar = Calendar.create({ holidays: ["2025-06-09"] });

    const businessDays = calendar.countBusinessDays("2025-06-01", "2025-07-01");

    expect(businessDays).toEqual(20);
  });
});
