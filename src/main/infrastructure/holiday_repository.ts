// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";

import { Temporal } from "@js-temporal/polyfill";
import { ConfigurableResponses } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import { stringify } from "csv/sync";

import { Holiday } from "../domain/calendar";
import path from "node:path";
import type { Options as ParseOptions } from "csv-parse";
import type { Options as StringifyOptions } from "csv-stringify";

export class HolidayRepository {
  static create({
    fileName = "data/holidays.csv",
  }: { fileName?: string } = {}): HolidayRepository {
    return new HolidayRepository(fileName, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (Holiday[] | null | Error)[];
  } = {}): HolidayRepository {
    return new HolidayRepository(
      "null-holidays.csv",
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  fileName: string;

  readonly #fs: typeof fsPromise;

  private constructor(fileName: string, fs: typeof fsPromise) {
    this.fileName = fileName;
    this.#fs = fs;
  }

  async findAll(): Promise<Holiday[]> {
    try {
      const fileContent = await this.#fs.readFile(this.fileName);
      const records = parse(fileContent, PARSE_CONFIGURATION);
      const holidays: Holiday[] = [];
      for await (const record of records) {
        validateRecord(record);
        const holiday = Holiday.create(record);
        holidays.push(holiday);
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

  async findAllByDate(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
  ): Promise<Holiday[]> {
    const holidays = await this.findAll();
    return holidays.filter(
      (holiday) =>
        Temporal.PlainDate.compare(holiday.date, from) >= 0 &&
        Temporal.PlainDate.compare(holiday.date, to) <= 0,
    );
  }

  async saveAll(holidays: Holiday[]): Promise<void> {
    const merged = await this.findAll();
    for (const holiday of holidays) {
      const index = merged.findIndex(
        (savedHoliday) =>
          Temporal.PlainDate.compare(savedHoliday.date, holiday.date) === 0,
      );
      if (index >= 0) {
        merged[index] = holiday;
      } else {
        merged.push(holiday);
      }
    }

    const dirName = path.resolve(path.dirname(this.fileName));
    await this.#fs.mkdir(dirName, { recursive: true });
    const stringifier = stringify(merged, STRINGIFY_CONFIGURATION);
    await this.#fs.writeFile(this.fileName, stringifier);
  }
}

const PARSE_CONFIGURATION: ParseOptions = {
  cast: (value, context) =>
    value == "" && !context.quoting ? undefined : value,
  columns: (header) =>
    header.map((column) => {
      switch (column) {
        case "Date":
          return "date";
        case "Title":
          return "title";
        case "Duration":
          return "duration";
        default:
          return column;
      }
    }),
};

const STRINGIFY_CONFIGURATION: StringifyOptions = {
  header: true,
  record_delimiter: "\r\n",
  columns: [
    { key: "date", header: "Date" },
    { key: "title", header: "Title" },
    { key: "duration", header: "Duration" },
  ],
  cast: {
    object: (value, context) => {
      if (context.column === "date" || context.column === "duration") {
        return value.toString();
      } else {
        return JSON.stringify(value);
      }
    },
  },
};

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", format: "date" },
    duration: { type: "string", format: "duration" },
  },
  required: ["date", "title"],
  additionalProperties: false,
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function validateRecord(record: unknown) {
  const ajv = new Ajv();
  addFormats(ajv);
  const valid = ajv.validate(SCHEMA, record);
  if (!valid) {
    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid holiday data:\n${errors}`);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<Holiday[] | null | Error>;

  constructor(readFileResponses: (Holiday[] | null | Error)[]) {
    this.#readFileResponses = ConfigurableResponses.create(
      readFileResponses,
      "read file",
    );
  }

  async readFile() {
    const response = this.#readFileResponses.next();
    if (response === null) {
      throw { code: "ENOENT" };
    }
    if (response instanceof Error) {
      throw response;
    }

    const s = stringify(response, STRINGIFY_CONFIGURATION);
    return Promise.resolve(s);
  }
}
