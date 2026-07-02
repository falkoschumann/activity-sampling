// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { countWorkingHours } from "../../../src/shared/domain/calendar.service";
import { createHoliday } from "../../../src/shared/domain/holiday/holiday.aggregate";
import { createVacation } from "../../../src/shared/domain/vacation/vacation.aggregate";

describe("Calendar", () => {
  it("should count business hours", () => {
    const hours = countWorkingHours("2025-06-01", "2025-06-30");

    expect(hours).toEqual(Temporal.Duration.from("PT168H"));
  });

  it("should count business hours with holidays", () => {
    const holidays = [
      createHoliday({ date: "2025-06-09", title: "Pfingstmontag" }),
    ];

    const hours = countWorkingHours("2025-06-01", "2025-06-30", { holidays });

    expect(hours).toEqual(Temporal.Duration.from("PT160H"));
  });

  it("should count business hours with half holidays", () => {
    const holidays = [
      createHoliday({
        date: "2025-12-24",
        title: "Heiligabend",
        duration: "PT4H",
      }),
      createHoliday({
        date: "2025-12-25",
        title: "1. Weihnachtsfeiertag",
        duration: "PT8H",
      }),
      createHoliday({ date: "2025-12-26", title: "2. Weihnachtsfeiertag" }),
    ];

    const hours = countWorkingHours("2025-12-22", "2025-12-28", { holidays });

    expect(hours).toEqual(Temporal.Duration.from("PT20H"));
  });

  it("should count business hours with vacation", () => {
    const vacations = [createVacation({ date: "2025-09-10" })];

    const hours = countWorkingHours("2025-09-08", "2025-09-14", { vacations });

    expect(hours).toEqual(Temporal.Duration.from("PT32H"));
  });

  it("should count business hours with half vacation", () => {
    const holidays = [
      createHoliday({
        date: "2025-12-24",
        title: "Heiligabend",
        duration: "PT4H",
      }),
      createHoliday({
        date: "2025-12-25",
        title: "1. Weihnachtsfeiertag",
        duration: "PT8H",
      }),
      createHoliday({ date: "2025-12-26", title: "2. Weihnachtsfeiertag" }),
    ];
    const vacations = [
      createVacation({
        date: "2025-12-22",
      }),
      createVacation({
        date: "2025-12-23",
        duration: "PT8H",
      }),
      createVacation({ date: "2025-12-24", duration: "PT4H" }),
    ];

    const hours = countWorkingHours("2025-12-22", "2025-12-28", {
      holidays,
      vacations,
    });

    expect(hours).toEqual(Temporal.Duration.from("PT0S"));
  });
});
