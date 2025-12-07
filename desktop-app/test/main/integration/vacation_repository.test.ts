// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";

import { Temporal } from "@js-temporal/polyfill";
import { beforeEach, describe, expect, it } from "vitest";

import { Vacation } from "../../../src/main/domain/calendar";
import {
  VacationDto,
  VacationRepository,
} from "../../../src/main/infrastructure/vacation_repository";

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

const VACATION_DAY_1: Vacation = {
  date: Temporal.PlainDate.from("2025-09-11"),
  duration: Temporal.Duration.from("PT8H"),
};

const VACATION_DAY_2: Vacation = {
  date: Temporal.PlainDate.from("2025-09-12"),
};

describe("Vacation repository", () => {
  describe("Find all by date", () => {
    it("should find nothing when file does not exist", async () => {
      const repository = VacationRepository.create({
        fileName: NON_EXISTING_FILE,
      });

      const vacations = await repository.findAllByDate(
        "2025-09-08",
        "2025-09-14",
      );

      expect(vacations).toEqual<Vacation[]>([]);
    });

    it("should find all saved vacations", async () => {
      const repository = VacationRepository.create({ fileName: EXAMPLE_FILE });

      const vacations = await repository.findAllByDate(
        "2025-09-08",
        "2025-09-14",
      );

      expect(vacations).toEqual<Vacation[]>([VACATION_DAY_1, VACATION_DAY_2]);
    });

    it("should find all by date with lower limit", async () => {
      const repository = VacationRepository.create({ fileName: EXAMPLE_FILE });

      const vacations = await repository.findAllByDate(
        "2025-09-12",
        "2025-09-14",
      );

      expect(vacations).toEqual<Vacation[]>([VACATION_DAY_2]);
    });

    it("should find all by date with upper limit", async () => {
      const repository = VacationRepository.create({ fileName: EXAMPLE_FILE });

      const vacations = await repository.findAllByDate(
        "2025-09-08",
        "2025-09-11",
      );

      expect(vacations).toEqual<Vacation[]>([VACATION_DAY_1]);
    });
  });

  describe("Save all", () => {
    beforeEach(async () => {
      await fs.rm(TEST_FILE, { force: true });
    });

    it("should load saved vacations", async () => {
      const repository = VacationRepository.create({ fileName: TEST_FILE });

      await repository.saveAll([VACATION_DAY_1, VACATION_DAY_2]);
      const vacations = await repository.findAllByDate(
        "2025-09-08",
        "2025-09-14",
      );

      expect(vacations).toEqual<Vacation[]>([VACATION_DAY_1, VACATION_DAY_2]);
    });

    it("should update existing vacations", async () => {
      const repository = VacationRepository.create({ fileName: TEST_FILE });

      await repository.saveAll([VACATION_DAY_1]);
      await repository.saveAll([VACATION_DAY_2]);

      const vacations = await repository.findAllByDate(
        "2025-09-08",
        "2025-09-14",
      );
      expect(vacations).toEqual<Vacation[]>([VACATION_DAY_1, VACATION_DAY_2]);
    });
  });

  describe("Nullable", () => {
    describe("Find all by date", () => {
      it("should return nothing when configurable response is null", async () => {
        const repository = VacationRepository.createNull({
          readFileResponses: [null],
        });

        const vacations = await repository.findAllByDate(
          "2025-09-08",
          "2025-09-14",
        );

        expect(vacations).toEqual<Vacation[]>([]);
      });

      it("should return configurable responses", async () => {
        const repository = VacationRepository.createNull({
          readFileResponses: [[VacationDto.create({ date: "2025-09-10" })]],
        });

        const vacations = await repository.findAllByDate(
          "2025-09-08",
          "2025-09-14",
        );

        expect(vacations).toEqual<Vacation[]>([
          Vacation.create({ date: "2025-09-10" }),
        ]);
      });

      it("should throw an error when configurable response is an error", async () => {
        const repository = VacationRepository.createNull({
          readFileResponses: [new Error("Test error")],
        });

        const vacations = repository.findAllByDate("2025-01-01", "2025-12-31");

        await expect(vacations).rejects.toThrow("Test error");
      });
    });
  });
});

describe("Vacation DTO", () => {
  describe("Validate", () => {
    it("should throw a type error when DTO is not valid", () => {
      const dto = {
        date: "2025-13-01",
      };

      expect(() => VacationDto.fromJson(dto)).toThrow(TypeError);
    });
  });
});
