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

export interface HolidayConfiguration {
  readonly fileName: string;
}

export class HolidayRepository {
  static create(
    configuration: HolidayConfiguration = {
      fileName: "data/holidays.csv",
    },
  ): HolidayRepository {
    return new HolidayRepository(configuration, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (HolidayDto[] | null | Error)[];
  } = {}): HolidayRepository {
    return new HolidayRepository(
      { fileName: "null-holidays.csv" },
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  fileName: string;

  readonly #fs: typeof fsPromise;

  constructor(configuration: HolidayConfiguration, fs: typeof fsPromise) {
    this.fileName = configuration.fileName;
    this.#fs = fs;
  }

  async findAll(): Promise<Holiday[]> {
    try {
      const fileContent = await this.#fs.readFile(this.fileName);
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
              case "Duration":
                return "duration";
              default:
                return column;
            }
          }),
      });
      const holidays: Holiday[] = [];
      for await (const record of records) {
        const holiday = HolidayDto.fromJson(record).validate();
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
    const mergedDtos = merged.map((holiday) => HolidayDto.fromModel(holiday));

    const dirName = path.resolve(path.dirname(this.fileName));
    await this.#fs.mkdir(dirName, { recursive: true });
    const stringifier = stringify(mergedDtos, {
      header: true,
      record_delimiter: "\r\n",
      columns: [
        { key: "date", header: "Date" },
        { key: "title", header: "Title" },
        { key: "duration", header: "Duration" },
      ],
    });
    await this.#fs.writeFile(this.fileName, stringifier);
  }
}

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", format: "date" },
    duration: { type: "string", format: "duration" },
  },
  required: ["date", "title"],
  additionalProperties: false,
};

export class HolidayDto {
  static create({
    date,
    title,
    duration,
  }: {
    date: string;
    title: string;
    duration?: string;
  }): HolidayDto {
    return new HolidayDto(date, title, duration);
  }

  static fromModel(model: Holiday): HolidayDto {
    return HolidayDto.create({
      date: model.date.toString(),
      title: model.title,
      duration: model.duration?.toString(),
    });
  }

  static fromJson(json: unknown): HolidayDto {
    const ajv = new Ajv();
    addFormats(ajv);
    const valid = ajv.validate(schema, json);
    if (valid) {
      return HolidayDto.create(json as HolidayDto);
    }

    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid holiday data:\n${errors}`);
  }

  readonly date: string;
  readonly title: string;
  readonly duration?: string;

  private constructor(date: string, title: string, duration?: string) {
    this.date = date;
    this.title = title;
    this.duration = duration;
  }

  validate(): Holiday {
    return Holiday.create(this);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<
    HolidayDto[] | null | Error
  >;

  constructor(readFileResponses: (HolidayDto[] | null | Error)[]) {
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

    const s = stringify(response, { header: true });
    return Promise.resolve(s);
  }
}
