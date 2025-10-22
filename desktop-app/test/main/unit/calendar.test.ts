// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Calendar, Holiday, Vacation } from "../../../src/main/domain/calendar";
import { Temporal } from "@js-temporal/polyfill";

describe("Calendar", () => {
  it("should count business hours", () => {
    const calendar = Calendar.create();

    const hours = calendar.countWorkingHours("2025-06-01", "2025-07-01");

    expect(hours).toEqual<Temporal.Duration>(Temporal.Duration.from("PT168H"));
  });

  it("should count business hours with holidays", () => {
    const calendar = Calendar.create({
      holidays: [
        Holiday.create({ date: "2025-06-09", title: "Pfingstmontag" }),
      ],
    });

    const hours = calendar.countWorkingHours("2025-06-01", "2025-07-01");

    expect(hours).toEqual<Temporal.Duration>(Temporal.Duration.from("PT160H"));
  });

  it("should count business hours with half holidays", () => {
    const calendar = Calendar.create({
      holidays: [
        Holiday.create({
          date: "2025-12-24",
          title: "Heiligabend",
          duration: "PT4H",
        }),
        Holiday.create({
          date: "2025-12-25",
          title: "1. Weihnachtsfeiertag",
          duration: "PT8H",
        }),
        Holiday.create({ date: "2025-12-26", title: "2. Weihnachtsfeiertag" }),
      ],
    });

    const hours = calendar.countWorkingHours("2025-12-22", "2025-12-28");

    expect(hours).toEqual<Temporal.Duration>(Temporal.Duration.from("PT20H"));
  });

  it("should count business hours with vacation", () => {
    const calendar = Calendar.create({
      vacations: [Vacation.create({ date: "2025-09-10" })],
    });

    const hours = calendar.countWorkingHours("2025-09-08", "2025-09-14");

    expect(hours).toEqual<Temporal.Duration>(Temporal.Duration.from("PT32H"));
  });

  it("should count business hours with half vacation", () => {
    const calendar = Calendar.create({
      holidays: [
        Holiday.create({
          date: "2025-12-24",
          title: "Heiligabend",
          duration: "PT4H",
        }),
        Holiday.create({
          date: "2025-12-25",
          title: "1. Weihnachtsfeiertag",
          duration: "PT8H",
        }),
        Holiday.create({ date: "2025-12-26", title: "2. Weihnachtsfeiertag" }),
      ],
      vacations: [
        Vacation.create({
          date: "2025-12-22",
        }),
        Vacation.create({
          date: "2025-12-23",
          duration: "PT8H",
        }),
        Vacation.create({ date: "2025-12-24", duration: "PT4H" }),
      ],
    });

    const hours = calendar.countWorkingHours("2025-12-22", "2025-12-28");

    expect(hours).toEqual<Temporal.Duration>(Temporal.Duration.from("PT0S"));
  });
});
