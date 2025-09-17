// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";

import { Temporal } from "@js-temporal/polyfill";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import { stringify as syncStringify } from "csv-stringify/sync";

import { ConfigurableResponses } from "@muspellheim/shared";

import type { Holiday } from "../domain/calendar";

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", format: "date" },
  },
  required: ["date", "title"],
  additionalProperties: false,
};

export class HolidayRepository extends EventTarget {
  static create({
    fileName = "data/holidays.csv",
  }: { fileName?: string } = {}) {
    return new HolidayRepository(fileName, fsPromise);
  }

  static createNull({
    holidays,
  }: { holidays?: Holiday[][] } = {}): HolidayRepository {
    return new HolidayRepository(
      "null-file-csv",
      new FsPromiseStub(holidays) as unknown as typeof fsPromise,
    );
  }

  readonly #fileName: string;
  readonly #fs: typeof fsPromise;

  constructor(fileName: string, fs: typeof fsPromise) {
    super();
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async findAllByDate(
    startInclusive: Temporal.PlainDate | Temporal.PlainDateLike | string,
    endExclusive: Temporal.PlainDate | Temporal.PlainDateLike | string,
  ): Promise<Holiday[]> {
    try {
      const fileContent = await this.#fs.readFile(this.#fileName);
      const records = parse(fileContent, {
        cast: (value, context) =>
          value == "" && !context.quoting ? undefined : value,
        columns: (header) =>
          header.map((column) => {
            switch (column) {
              case "Date":
                return "date";
              case "Title":
                return "title";
              default:
                return column;
            }
          }),
      });
      const holidays: Holiday[] = [];
      for await (const record of records) {
        const holiday = HolidayDto.from(record);
        const date = Temporal.PlainDate.from(holiday.date);
        if (
          Temporal.PlainDate.compare(date, startInclusive) >= 0 &&
          Temporal.PlainDate.compare(date, endExclusive) < 0
        ) {
          holidays.push({
            date: holiday.date,
            title: holiday.title,
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

  readonly date: string;
  readonly title: string;

  constructor(data: HolidayDto) {
    this.date = data.date;
    this.title = data.title;
  }
}

class FsPromiseStub {
  readonly #configurableResponses: ConfigurableResponses;

  constructor(holidays?: unknown[][]) {
    this.#configurableResponses = ConfigurableResponses.create(holidays);
  }

  async readFile() {
    const response = this.#configurableResponses.next();
    const s = syncStringify(response as unknown[], { header: true });
    return Promise.resolve(s);
  }
}
