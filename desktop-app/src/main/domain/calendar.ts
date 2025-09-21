// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class Holiday {
  date: Temporal.PlainDate;
  title: string;

  constructor(date: Temporal.PlainDateLike | string, title: string) {
    this.date = Temporal.PlainDate.from(date);
    this.title = title;
  }
}

export class Calendar {
  static create({
    holidays = [],
  }: {
    holidays?: (Temporal.PlainDate | Temporal.PlainDateLike | string)[];
  } = {}): Calendar {
    return new Calendar(holidays.map((date) => date.toString()));
  }

  // Monday to Friday
  readonly #businessDays = [1, 2, 3, 4, 5];

  readonly #holidays: string[];

  private constructor(holidays: string[]) {
    this.#holidays = holidays;
  }

  isBusinessDay(date: Temporal.PlainDate | Temporal.PlainDateLike | string) {
    const plainDate = Temporal.PlainDate.from(date);
    return this.#businessDays.includes(plainDate.dayOfWeek);
  }

  isHoliday(date: Temporal.PlainDateLike | string) {
    const s = date.toString();
    return this.#holidays.includes(s);
  }

  countBusinessDays(
    startInclusive: Temporal.PlainDate | Temporal.PlainDateLike | string,
    endExclusive: Temporal.PlainDate | Temporal.PlainDateLike | string,
  ) {
    let date = Temporal.PlainDate.from(startInclusive);
    const end = Temporal.PlainDate.from(endExclusive);
    let count = 0;
    while (Temporal.PlainDate.compare(date, end) === -1) {
      if (this.isBusinessDay(date) && !this.isHoliday(date)) {
        count++;
      }
      date = date.add({ days: 1 });
    }
    return count;
  }
}
