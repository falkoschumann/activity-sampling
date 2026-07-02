// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import {
  createVacation,
  type VacationState,
} from "../../../src/shared/domain/vacation/vacation.aggregate";
import { VacationRepository } from "../../../src/main/infrastructure/vacation.repository";

const NON_EXISTING_FILE = path.resolve(
  import.meta.dirname,
  "../data/vacation/non-existing.csv",
);

const EXAMPLE_FILE = path.resolve(
  import.meta.dirname,
  "../data/vacation/example.csv",
);

const TEST_FILE = path.resolve(
  import.meta.dirname,
  "../../../testdata/test-vacation.csv",
);

const VACATION_DAY_1: VacationState = {
  date: Temporal.PlainDate.from("2025-09-11"),
  duration: Temporal.Duration.from("PT8H"),
};

const VACATION_DAY_2: VacationState = {
  date: Temporal.PlainDate.from("2025-09-12"),
};

describe("Vacation repository", () => {
  beforeEach(async () => {
    await fs.rm(TEST_FILE, { force: true });
  });

  it("should find all vacations", async () => {
    const repository = VacationRepository.create({ filename: EXAMPLE_FILE });

    const vacations = await repository.findAll();

    expect(vacations).toEqual<VacationState[]>([
      VACATION_DAY_1,
      VACATION_DAY_2,
    ]);
  });

  it("should find nothing when file does not exist", async () => {
    const repository = VacationRepository.create({
      filename: NON_EXISTING_FILE,
    });

    const vacations = await repository.findAll();

    expect(vacations).toEqual<VacationState[]>([]);
  });

  it("should find all by date with lower limit", async () => {
    const repository = VacationRepository.create({ filename: EXAMPLE_FILE });

    const vacations = await repository.findAllByDate(
      "2025-09-12",
      "2025-09-14",
    );

    expect(vacations).toEqual<VacationState[]>([VACATION_DAY_2]);
  });

  it("should find all by date with upper limit", async () => {
    const repository = VacationRepository.create({ filename: EXAMPLE_FILE });

    const vacations = await repository.findAllByDate(
      "2025-09-08",
      "2025-09-11",
    );

    expect(vacations).toEqual<VacationState[]>([VACATION_DAY_1]);
  });

  it("should load saved vacations", async () => {
    const repository = VacationRepository.create({ filename: TEST_FILE });

    await repository.saveAll([VACATION_DAY_1, VACATION_DAY_2]);
    const vacations = await repository.findAllByDate(
      "2025-09-08",
      "2025-09-14",
    );

    expect(vacations).toEqual<VacationState[]>([
      VACATION_DAY_1,
      VACATION_DAY_2,
    ]);
  });

  it("should update existing vacations", async () => {
    const repository = VacationRepository.create({ filename: TEST_FILE });

    await repository.saveAll([VACATION_DAY_1]);
    await repository.saveAll([VACATION_DAY_2]);

    const vacations = await repository.findAllByDate(
      "2025-09-08",
      "2025-09-14",
    );
    expect(vacations).toEqual<VacationState[]>([
      VACATION_DAY_1,
      VACATION_DAY_2,
    ]);
  });

  it("should return configurable responses", async () => {
    const repository = VacationRepository.createNull({
      readFileResponses: [[createVacation({ date: "2025-09-10" })]],
    });

    const vacations = await repository.findAllByDate(
      "2025-09-08",
      "2025-09-14",
    );

    expect(vacations).toEqual<VacationState[]>([
      createVacation({ date: "2025-09-10" }),
    ]);
  });

  it("should return nothing when configurable response is null", async () => {
    const repository = VacationRepository.createNull({
      readFileResponses: [null],
    });

    const vacations = await repository.findAllByDate(
      "2025-09-08",
      "2025-09-14",
    );

    expect(vacations).toEqual<VacationState[]>([]);
  });

  it("should throw an error when configurable response is an error", async () => {
    const repository = VacationRepository.createNull({
      readFileResponses: [new Error("Test error")],
    });

    const vacations = repository.findAllByDate("2025-01-01", "2025-12-31");

    await expect(vacations).rejects.toThrow("Test error");
  });
});
