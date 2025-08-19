// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import fsPromise from "node:fs/promises";

import type { Holiday } from "../domain/calendar";

const schema = {
  type: "object",
  properties: {
    Date: { type: "string", format: "date" },
    Title: { type: "string" },
  },
  required: ["Date", "Title"],
  additionalProperties: false,
};

export class HolidayRepository extends EventTarget {
  static create({
    fileName = "data/holidays.csv",
  }: { fileName?: string } = {}) {
    return new HolidayRepository(fileName, fsPromise);
  }

  readonly #fileName: string;
  readonly #fs: typeof fsPromise;

  constructor(fileName: string, fs: typeof fsPromise) {
    super();
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async findAllByDate(
    startInclusive: Temporal.PlainDateLike | string,
    endExclusive: Temporal.PlainDateLike | string,
  ): Promise<Holiday[]> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName);
      const records = parse(fileContent, {
        cast: (value, context) =>
          value == "" && !context.quoting ? undefined : value,
        columns: true,
      });
      const holidays: Holiday[] = [];
      for await (const record of records) {
        const holiday = HolidayDto.from(record);
        const date = Temporal.PlainDate.from(holiday.Date);
        if (
          Temporal.PlainDate.compare(date, startInclusive) >= 0 &&
          Temporal.PlainDate.compare(date, endExclusive) < 0
        ) {
          holidays.push({
            date: holiday.Date,
            title: holiday.Title,
          });
        }
      }
      return holidays;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // No such file or directory, no events recorded yet
        return [];
      }

      throw error;
    }
  }
}

export class HolidayDto {
  static create(data: HolidayDto): HolidayDto {
    return new HolidayDto(data);
  }

  static from(data: unknown): HolidayDto {
    const ajv = new Ajv();
    addFormats(ajv);
    const valid = ajv.validate(schema, data);
    if (valid) {
      return HolidayDto.create(data as HolidayDto);
    }

    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid holiday data:\n${errors}`);
  }

  readonly Date: string;
  readonly Title: string;

  constructor(data: HolidayDto) {
    this.Date = data.Date;
    this.Title = data.Title;
  }
}
