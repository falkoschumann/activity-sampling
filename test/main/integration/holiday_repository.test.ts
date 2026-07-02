// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import {
  createHoliday,
  type HolidayState,
} from "../../../src/shared/domain/holiday/holiday.aggregate";
import { HolidayRepository } from "../../../src/main/infrastructure/holiday.repository";

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/holidays/non-existing.csv",
);

const EXAMPLE_FILE = path.resolve(
  import.meta.dirname,
  "../data/holidays/example.csv",
);

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-holidays.csv",
);

const KARFREITAG: HolidayState = {
  date: Temporal.PlainDate.from("2025-04-18"),
  title: "Karfreitag",
};

const OSTERSONNTAG: HolidayState = {
  date: Temporal.PlainDate.from("2025-04-20"),
  title: "Ostersonntag",
};

const OSTERMONTAG: HolidayState = {
  date: Temporal.PlainDate.from("2025-04-21"),
  title: "Ostermontag",
  duration: Temporal.Duration.from("PT8H"),
};

describe("Holiday repository", () => {
  beforeEach(async () => {
    await fs.rm(TEST_FILE, { force: true });
  });

  it("should find all holidays", async () => {
    const repository = HolidayRepository.create({ filename: EXAMPLE_FILE });

    const holidays = await repository.findAll();

    expect(holidays).toEqual<HolidayState[]>([
      KARFREITAG,
      OSTERSONNTAG,
      OSTERMONTAG,
    ]);
  });

  it("should find nothing when file does not exist", async () => {
    const repository = HolidayRepository.create({
      filename: NON_EXISTING_FILE,
    });

    const holidays = await repository.findAll();

    expect(holidays).toEqual<HolidayState[]>([]);
  });

  it("should find all by date with lower limit", async () => {
    const repository = HolidayRepository.create({ filename: EXAMPLE_FILE });

    const holidays = await repository.findAllByDate("2025-04-21", "2025-04-27");

    expect(holidays).toEqual<HolidayState[]>([OSTERMONTAG]);
  });

  it("should find all by date with upper limit", async () => {
    const repository = HolidayRepository.create({ filename: EXAMPLE_FILE });

    const holidays = await repository.findAllByDate("2025-04-14", "2025-04-20");

    expect(holidays).toEqual<HolidayState[]>([KARFREITAG, OSTERSONNTAG]);
  });

  it("should load saved holidays", async () => {
    const repository = HolidayRepository.create({ filename: TEST_FILE });

    await repository.saveAll([KARFREITAG, OSTERSONNTAG]);
    const holidays = await repository.findAllByDate("2025-04-14", "2025-04-20");

    expect(holidays).toEqual<HolidayState[]>([KARFREITAG, OSTERSONNTAG]);
  });

  it("should update existing holidays", async () => {
    const repository = HolidayRepository.create({ filename: TEST_FILE });

    await repository.saveAll([
      createHoliday({ date: "2025-10-08", title: "Foo" }),
      createHoliday({ date: "2025-10-10", title: "Bar" }),
    ]);
    await repository.saveAll([
      createHoliday({ date: "2025-10-08", title: "Changed" }),
    ]);

    const holidays = await repository.findAllByDate("2025-10-06", "2025-10-12");
    expect(holidays).toEqual<HolidayState[]>([
      createHoliday({ date: "2025-10-08", title: "Changed" }),
      createHoliday({ date: "2025-10-10", title: "Bar" }),
    ]);
  });

  it("should return configurable responses", async () => {
    const repository = HolidayRepository.createNull({
      readFileResponses: [
        [createHoliday({ date: "2025-06-09", title: "Pfingstmontag" })],
      ],
    });

    const holidays = await repository.findAllByDate("2025-01-01", "2025-12-31");

    expect(holidays).toEqual<HolidayState[]>([
      createHoliday({ date: "2025-06-09", title: "Pfingstmontag" }),
    ]);
  });

  it("should return nothing when configurable response is null", async () => {
    const repository = HolidayRepository.createNull({
      readFileResponses: [null],
    });

    const holidays = await repository.findAllByDate("2025-01-01", "2025-12-31");

    expect(holidays).toEqual<HolidayState[]>([]);
  });

  it("should throw an error when configurable response is an error", async () => {
    const repository = HolidayRepository.createNull({
      readFileResponses: [new Error("Test error")],
    });

    const holidays = repository.findAllByDate("2025-01-01", "2025-12-31");

    await expect(holidays).rejects.toThrow("Test error");
  });
});
