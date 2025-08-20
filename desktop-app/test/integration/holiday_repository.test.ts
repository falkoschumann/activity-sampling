// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import { describe, expect, it } from "vitest";

import type { Holiday } from "../../src/main/domain/calendar";
import { HolidayRepository } from "../../src/main/infrastructure/holiday_repository";

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../test/data/holidays.csv",
);
const TESTDATA_FILE = path.resolve(import.meta.dirname, "../data/holidays.csv");
const KARFREITAG: Holiday = { date: "2025-04-18", title: "Karfreitag" };
const OSTERSONNTAG: Holiday = { date: "2025-04-20", title: "Ostersonntag" };
const OSTERMONTAG: Holiday = { date: "2025-04-21", title: "Ostermontag" };

describe("Holiday repository", () => {
  it("Finds nothing when file does not exists", async () => {
    const repository = HolidayRepository.create({
      fileName: NON_EXISTING_FILE,
    });

    const holidays = await repository.findAllByDate("2025-01-01", "2025-12-31");

    expect(holidays).toEqual([]);
  });

  it("Finds all saved holidays", async () => {
    const repository = HolidayRepository.create({ fileName: TESTDATA_FILE });

    const holidays = await repository.findAllByDate("2025-01-01", "2025-12-31");

    expect(holidays).toEqual([KARFREITAG, OSTERSONNTAG, OSTERMONTAG]);
  });

  it("finds all by date with lower limit", async () => {
    const repository = HolidayRepository.create({ fileName: TESTDATA_FILE });

    const holidays = await repository.findAllByDate("2025-04-21", "2025-04-28");

    expect(holidays).toEqual([OSTERMONTAG]);
  });

  it("finds all by date with upper limit", async () => {
    const repository = HolidayRepository.create({ fileName: TESTDATA_FILE });

    const holidays = await repository.findAllByDate("2025-04-14", "2025-04-21");

    expect(holidays).toEqual([KARFREITAG, OSTERSONNTAG]);
  });

  describe("Nulled holiday repository", () => {
    it("Finds all by date", async () => {
      const repository = HolidayRepository.createNull({
        holidays: [[{ date: "2025-06-09", title: "Pfingstmontag" }]],
      });

      const holidays = await repository.findAllByDate(
        "2025-01-01",
        "2025-12-31",
      );

      expect(holidays).toEqual([
        { date: "2025-06-09", title: "Pfingstmontag" },
      ]);
    });
  });
});
