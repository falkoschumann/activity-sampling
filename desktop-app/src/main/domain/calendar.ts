// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Holiday {
  static create({
    date,
    title,
  }: {
    date: Temporal.PlainDateLike | string;
    title: string;
  }): Holiday {
    return new Holiday(date, title);
  }

  date: Temporal.PlainDate;
  title: string;

  private constructor(date: Temporal.PlainDateLike | string, title: string) {
    this.date = Temporal.PlainDate.from(date);
    this.title = title;
  }
}

export class Vacation {
  static create({ date }: { date: Temporal.PlainDateLike | string }): Vacation {
    return new Vacation(date);
  }

  date: Temporal.PlainDate;

  private constructor(date: Temporal.PlainDateLike | string) {
    this.date = Temporal.PlainDate.from(date);
  }
}

export class Calendar {
  static create({
    holidays = [],
    vacations = [],
  }: {
    holidays?: Holiday[];
    vacations?: Vacation[];
  } = {}): Calendar {
    return new Calendar(holidays, vacations);
  }

  // Monday to Friday
  readonly #businessDays = [1, 2, 3, 4, 5];

  readonly #holidays: Holiday[];
  readonly #vacations: Vacation[];

  private constructor(holidays: Holiday[], vacations: Vacation[]) {
    this.#holidays = holidays;
    this.#vacations = vacations;
  }

  isBusinessDay(date: Temporal.PlainDateLike | string) {
    const plainDate = Temporal.PlainDate.from(date);
    return this.#businessDays.includes(plainDate.dayOfWeek);
  }

  isHoliday(date: Temporal.PlainDateLike | string) {
    date = Temporal.PlainDate.from(date);
    return this.#holidays.some(
      (holiday) => Temporal.PlainDate.compare(holiday.date, date) === 0,
    );
  }

  isVacation(date: Temporal.PlainDateLike | string) {
    date = Temporal.PlainDate.from(date);
    return this.#vacations.some(
      (vacation) => Temporal.PlainDate.compare(vacation.date, date) === 0,
    );
  }

  countBusinessDays(
    startInclusive: Temporal.PlainDateLike | string,
    endExclusive: Temporal.PlainDateLike | string,
  ) {
    let date = Temporal.PlainDate.from(startInclusive);
    const end = Temporal.PlainDate.from(endExclusive);
    let count = 0;
    while (Temporal.PlainDate.compare(date, end) === -1) {
      if (
        this.isBusinessDay(date) &&
        !this.isHoliday(date) &&
        !this.isVacation(date)
      ) {
        count++;
      }
      date = date.add({ days: 1 });
    }
    return count;
  }
}
