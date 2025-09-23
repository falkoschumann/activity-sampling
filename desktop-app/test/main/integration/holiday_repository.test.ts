// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";

import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

import type { Holiday } from "../../../src/main/domain/calendar";
import { HolidayRepository } from "../../../src/main/infrastructure/holiday_repository";

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/holidays/non-existing.csv",
);

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../data/holidays/example.csv",
);

const KARFREITAG: Holiday = {
  date: Temporal.PlainDate.from("2025-04-18"),
  title: "Karfreitag",
};

const OSTERSONNTAG: Holiday = {
  date: Temporal.PlainDate.from("2025-04-20"),
  title: "Ostersonntag",
};

const OSTERMONTAG: Holiday = {
  date: Temporal.PlainDate.from("2025-04-21"),
  title: "Ostermontag",
};

describe("Holiday repository", () => {
  it("should find nothing when file does not exist", async () => {
    const repository = HolidayRepository.create({
      fileName: NON_EXISTING_FILE,
    });

    const holidays = await repository.findAllByDate("2025-01-01", "2025-12-31");

    expect(holidays).toEqual([]);
  });

  it("should find all saved holidays", async () => {
    const repository = HolidayRepository.create({ fileName: TEST_FILE });

    const holidays = await repository.findAllByDate("2025-01-01", "2025-12-31");

    expect(holidays).toEqual([KARFREITAG, OSTERSONNTAG, OSTERMONTAG]);
  });

  it("should find all by date with lower limit", async () => {
    const repository = HolidayRepository.create({ fileName: TEST_FILE });

    const holidays = await repository.findAllByDate("2025-04-21", "2025-04-28");

    expect(holidays).toEqual([OSTERMONTAG]);
  });

  it("should find all by date with upper limit", async () => {
    const repository = HolidayRepository.create({ fileName: TEST_FILE });

    const holidays = await repository.findAllByDate("2025-04-14", "2025-04-21");

    expect(holidays).toEqual([KARFREITAG, OSTERSONNTAG]);
  });

  describe("Nulled holiday repository", () => {
    it("should find all by date", async () => {
      const repository = HolidayRepository.createNull({
        holidays: [{ date: "2025-06-09", title: "Pfingstmontag" }],
      });

      const holidays = await repository.findAllByDate(
        "2025-01-01",
        "2025-12-31",
      );

      expect(holidays).toEqual([
        { date: Temporal.PlainDate.from("2025-06-09"), title: "Pfingstmontag" },
      ]);
    });
  });
});
