// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";

import { Temporal } from "@js-temporal/polyfill";
import { ConfigurableResponses } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import { stringify as syncStringify } from "csv-stringify/sync";

import { Holiday } from "../domain/calendar";
import { HolidayConfiguration } from "./configuration_gateway";

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
  static create(configuration = HolidayConfiguration.createDefault()) {
    return new HolidayRepository(configuration, fsPromise);
  }

  static createNull({
    holidays,
  }: {
    holidays?: HolidayDto[];
  } = {}): HolidayRepository {
    return new HolidayRepository(
      new HolidayConfiguration("null-file-csv"),
      new FsPromiseStub(holidays) as unknown as typeof fsPromise,
    );
  }

  readonly #configuration: HolidayConfiguration;
  readonly #fs: typeof fsPromise;

  constructor(configuration: HolidayConfiguration, fs: typeof fsPromise) {
    super();
    this.#configuration = configuration;
    this.#fs = fs;
  }

  async findAllByDate(
    startInclusive: Temporal.PlainDateLike | string,
    endExclusive: Temporal.PlainDateLike | string,
  ): Promise<Holiday[]> {
    try {
      const fileContent = await this.#fs.readFile(this.#configuration.fileName);
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
        const dto = HolidayDto.from(record);
        const holiday = validateHoliday(dto);
        if (
          Temporal.PlainDate.compare(holiday.date, startInclusive) >= 0 &&
          Temporal.PlainDate.compare(holiday.date, endExclusive) < 0
        ) {
          holidays.push(holiday);
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

function validateHoliday(dto: HolidayDto): Holiday {
  return new Holiday(dto.date, dto.title);
}

class FsPromiseStub {
  readonly #configurableResponses: ConfigurableResponses;

  constructor(holidays?: unknown[]) {
    this.#configurableResponses = ConfigurableResponses.create(
      holidays ? [holidays] : undefined,
      "filesystem stub",
    );
  }

  async readFile() {
    const response = this.#configurableResponses.next();
    const s = syncStringify(response as unknown[], { header: true });
    return Promise.resolve(s);
  }
}
