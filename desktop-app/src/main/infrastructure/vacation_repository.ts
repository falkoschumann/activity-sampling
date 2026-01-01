// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { Temporal } from "@js-temporal/polyfill";
import { ConfigurableResponses } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import { stringify } from "csv/sync";

import { Vacation } from "../domain/calendar";

export interface VacationConfiguration {
  readonly fileName: string;
}

export class VacationRepository {
  static create(
    configuration: VacationConfiguration = {
      fileName: "data/vacation.csv",
    },
  ): VacationRepository {
    return new VacationRepository(configuration, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (VacationDto[] | null | Error)[];
  } = {}): VacationRepository {
    return new VacationRepository(
      { fileName: "null-holidays.csv" },
      new FsPromiseStub(readFileResponses) as unknown as typeof fsPromise,
    );
  }

  fileName: string;

  readonly #fs: typeof fsPromise;

  constructor(configuration: VacationConfiguration, fs: typeof fsPromise) {
    this.fileName = configuration.fileName;
    this.#fs = fs;
  }

  async findAll(): Promise<Vacation[]> {
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
              case "Duration":
                return "duration";
              default:
                return column;
            }
          }),
      });
      const vacations: Vacation[] = [];
      for await (const record of records) {
        const vacation = VacationDto.fromJson(record).validate();
        vacations.push(vacation);
      }
      return vacations;
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
  ): Promise<Vacation[]> {
    const vacations = await this.findAll();
    return vacations.filter(
      (vacation) =>
        Temporal.PlainDate.compare(vacation.date, from) >= 0 &&
        Temporal.PlainDate.compare(vacation.date, to) <= 0,
    );
  }

  async saveAll(vacations: Vacation[]): Promise<void> {
    const merged = await this.findAll();
    for (const vacation of vacations) {
      const index = merged.findIndex(
        (savedVacation) =>
          Temporal.PlainDate.compare(savedVacation.date, vacation.date) === 0,
      );
      if (index >= 0) {
        merged[index] = vacation;
      } else {
        merged.push(vacation);
      }
    }
    const mergedDtos = merged.map((vacation) =>
      VacationDto.fromModel(vacation),
    );

    const dirName = path.resolve(path.dirname(this.fileName));
    await this.#fs.mkdir(dirName, { recursive: true });
    const stringifier = stringify(mergedDtos, {
      header: true,
      record_delimiter: "\r\n",
      columns: [
        { key: "date", header: "Date" },
        { key: "duration", header: "Duration" },
      ],
    });
    await this.#fs.writeFile(this.fileName, stringifier);
  }
}

const schema = {
  type: "object",
  properties: {
    date: { type: "string", format: "date" },
    duration: { type: "string", format: "duration" },
  },
  required: ["date"],
  additionalProperties: false,
};

export class VacationDto {
  static create({
    date,
    duration,
  }: {
    date: string;
    duration?: string;
  }): VacationDto {
    return new VacationDto(date, duration);
  }

  static fromModel(model: Vacation): VacationDto {
    return VacationDto.create({
      date: model.date.toString(),
      duration: model.duration?.toString(),
    });
  }

  static fromJson(json: unknown): VacationDto {
    const ajv = new Ajv();
    addFormats(ajv);
    const valid = ajv.validate(schema, json);
    if (valid) {
      return VacationDto.create(json as VacationDto);
    }

    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid vacation data:\n${errors}`);
  }

  readonly date: string;
  readonly duration?: string;

  private constructor(date: string, duration?: string) {
    this.date = date;
    this.duration = duration;
  }

  validate(): Vacation {
    return Vacation.create(this);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<
    VacationDto[] | null | Error
  >;

  constructor(readFileResponses: (VacationDto[] | null | Error)[]) {
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
