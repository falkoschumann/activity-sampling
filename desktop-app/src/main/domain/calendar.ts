// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { normalizeDuration } from "../../shared/common/temporal";

export class Holiday {
  static create({
    date,
    title,
    duration,
  }: {
    date: Temporal.PlainDateLike | string;
    title: string;
    duration?: Temporal.DurationLike | string;
  }): Holiday {
    return new Holiday(date, title, duration);
  }

  date: Temporal.PlainDate;
  title: string;
  duration?: Temporal.Duration;

  private constructor(
    date: Temporal.PlainDateLike | string,
    title: string,
    duration?: Temporal.DurationLike | string,
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.title = title;
    if (duration != null) {
      this.duration = Temporal.Duration.from(duration);
    }
  }
}

export class Vacation {
  static create({
    date,
    duration,
  }: {
    date: Temporal.PlainDateLike | string;
    duration?: Temporal.DurationLike | string;
  }): Vacation {
    return new Vacation(date, duration);
  }

  date: Temporal.PlainDate;
  duration?: Temporal.Duration;

  private constructor(
    date: Temporal.PlainDateLike | string,
    duration?: Temporal.DurationLike | string,
  ) {
    this.date = Temporal.PlainDate.from(date);
    if (duration != null) {
      this.duration = Temporal.Duration.from(duration);
    }
  }
}

export class Calendar {
  static create({
    holidays,
    vacations,
    capacity,
    businessDays,
  }: {
    holidays?: Holiday[];
    vacations?: Vacation[];
    capacity?: Temporal.DurationLike | string;
    businessDays?: number[];
  } = {}): Calendar {
    return new Calendar(holidays, vacations, capacity, businessDays);
  }

  readonly #holidays: Holiday[];
  readonly #vacations: Vacation[];
  readonly #capacity: Temporal.Duration;
  readonly #businessDays: number[];

  private constructor(
    holidays?: Holiday[],
    vacations?: Vacation[],
    capacity?: Temporal.DurationLike | string,
    businessDays?: number[],
  ) {
    this.#holidays = holidays ?? [];
    this.#vacations = vacations ?? [];
    this.#capacity = Temporal.Duration.from(capacity ?? "PT40H");
    this.#businessDays = businessDays ?? [1, 2, 3, 4, 5]; // Monday to Friday
  }

  countWorkingHours(
    from: Temporal.PlainDateLike | string,
    to: Temporal.PlainDateLike | string,
  ) {
    let date = Temporal.PlainDate.from(from);
    const end = Temporal.PlainDate.from(to);
    let count = Temporal.Duration.from("PT0H");
    const hoursPerDay = Temporal.Duration.from({
      seconds: Math.round(
        this.#capacity.total("seconds") / this.#businessDays.length,
      ),
    });
    while (Temporal.PlainDate.compare(date, end) <= 0) {
      if (this.#isBusinessDay(date)) {
        let hours = hoursPerDay;

        const holiday = this.#findHoliday(date);
        if (holiday != null) {
          hours = hours.subtract(holiday.duration ?? hoursPerDay);
        }

        const vacation = this.#findVacation(date);
        if (vacation != null) {
          hours = hours.subtract(vacation.duration ?? hoursPerDay);
        }

        count = count.add(hours);
      }
      date = date.add({ days: 1 });
    }
    return normalizeDuration(count);
  }

  #isBusinessDay(date: Temporal.PlainDateLike | string): boolean {
    const plainDate = Temporal.PlainDate.from(date);
    return this.#businessDays.includes(plainDate.dayOfWeek);
  }

  #findHoliday(date: Temporal.PlainDateLike | string): Holiday | undefined {
    return this.#holidays.find(
      (holiday) => Temporal.PlainDate.compare(holiday.date, date) === 0,
    );
  }

  #findVacation(date: Temporal.PlainDateLike | string): Vacation | undefined {
    return this.#vacations.find(
      (vacation) => Temporal.PlainDate.compare(vacation.date, date) === 0,
    );
  }
}
