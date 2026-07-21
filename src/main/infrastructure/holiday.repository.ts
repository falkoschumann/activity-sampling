// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses } from "@muspellheim/shared";
import Ajv, { type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import { stringify } from "csv/sync";
import type { Options as ParseOptions } from "csv-parse";
import type { Options as StringifyOptions } from "csv-stringify";

import {
  createHoliday,
  type HolidayState,
} from "../../shared/domain/holiday/holiday.aggregate";

export class HolidayRepository {
  static create({
    filename = "data/holidays.csv",
  }: { filename?: string } = {}) {
    return new HolidayRepository(filename, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (HolidayState[] | null | Error)[];
  } = {}) {
    return new HolidayRepository(
      "null-holidays.csv",
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  filename;

  readonly #fs;

  private constructor(filename: string, fs: typeof fsPromise) {
    this.filename = filename;
    this.#fs = fs;
  }

  async findAll(): Promise<HolidayState[]> {
    try {
      const fileContent = await this.#fs.readFile(this.filename);
      const records = parse(fileContent, PARSE_CONFIGURATION);
      const holidays: HolidayState[] = [];
      for await (const record of records) {
        validateRecord(record);
        const holiday = createHoliday(record);
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
    from: Temporal.PlainDateLike,
    to: Temporal.PlainDateLike,
  ): Promise<HolidayState[]> {
    const holidays = await this.findAll();
    return holidays.filter(
      (holiday) =>
        Temporal.PlainDate.compare(holiday.date, from) >= 0 &&
        Temporal.PlainDate.compare(holiday.date, to) <= 0,
    );
  }

  async saveAll(holidays: HolidayState[]): Promise<void> {
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

    const dirName = path.resolve(path.dirname(this.filename));
    await this.#fs.mkdir(dirName, { recursive: true });
    const stringifier = stringify(merged, STRINGIFY_CONFIGURATION);
    await this.#fs.writeFile(this.filename, stringifier);
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
};

const SCHEMA: JSONSchemaType<HolidayState> = {
  type: "object",
  properties: {
    date: { type: "string", format: "date" },
    title: { type: "string" },
    duration: { type: "string", format: "duration", nullable: true },
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
  readonly #readFileResponses: ConfigurableResponses<
    HolidayState[] | null | Error
  >;

  constructor(readFileResponses: (HolidayState[] | null | Error)[]) {
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
