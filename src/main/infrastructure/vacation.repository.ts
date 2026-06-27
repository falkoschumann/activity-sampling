// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses } from "@muspellheim/shared";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse } from "csv";
import { stringify } from "csv/sync";
import type { Options as ParseOptions } from "csv-parse";
import type { Options as StringifyOptions } from "csv-stringify";

import {
  createVacation,
  type VacationState,
} from "../domain/vacation/vacation.aggregate";

export class VacationRepository {
  static create({
    fileName = "data/vacation.csv",
  }: {
    fileName?: string;
  } = {}) {
    return new VacationRepository(fileName, fsPromise);
  }

  static createNull({
    readFileResponses = [],
  }: {
    readFileResponses?: (VacationState[] | null | Error)[];
  } = {}) {
    return new VacationRepository(
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

  async findAll(): Promise<VacationState[]> {
    try {
      const fileContent = await this.#fs.readFile(this.fileName);
      const records = parse(fileContent, PARSE_CONFIGURATION);
      const vacations: VacationState[] = [];
      for await (const record of records) {
        validateRecord(record);
        const vacation = createVacation(record);
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
    from: Temporal.PlainDateLike,
    to: Temporal.PlainDateLike,
  ): Promise<VacationState[]> {
    const vacations = await this.findAll();
    return vacations.filter(
      (vacation) =>
        Temporal.PlainDate.compare(vacation.date, from) >= 0 &&
        Temporal.PlainDate.compare(vacation.date, to) <= 0,
    );
  }

  async saveAll(vacations: VacationState[]): Promise<void> {
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
    date: { type: "string", format: "date" },
    duration: { type: "string", format: "duration" },
  },
  required: ["date"],
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
    throw new TypeError(`Invalid vacation data:\n${errors}`);
  }
}

class FsPromiseStub {
  readonly #readFileResponses: ConfigurableResponses<
    VacationState[] | null | Error
  >;

  constructor(readFileResponses: (VacationState[] | null | Error)[]) {
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
