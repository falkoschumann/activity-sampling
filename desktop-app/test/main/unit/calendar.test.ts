// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Calendar, Holiday, Vacation } from "../../../src/main/domain/calendar";

describe("Calendar", () => {
  it("should count business days", () => {
    const calendar = Calendar.create();

    const businessDays = calendar.countBusinessDays("2025-06-01", "2025-07-01");

    expect(businessDays).toEqual(21);
  });

  it("should count business days with holidays", () => {
    const calendar = Calendar.create({
      holidays: [
        Holiday.create({ date: "2025-06-09", title: "Pfingstmontag" }),
      ],
    });

    const businessDays = calendar.countBusinessDays("2025-06-01", "2025-07-01");

    expect(businessDays).toEqual(20);
  });

  it("should count business days with vacation", () => {
    const calendar = Calendar.create({
      vacations: [Vacation.create({ date: "2025-09-10" })],
    });

    const businessDays = calendar.countBusinessDays("2025-09-08", "2025-09-14");

    expect(businessDays).toEqual(4);
  });
});
