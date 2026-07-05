// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { HolidayState } from "../holiday/holiday.aggregate";
import type { VacationState } from "../vacation/vacation.aggregate";
import { normalizeDuration } from "../value_objects/activity.value_object";

export function countWorkingHours(
  from: Temporal.PlainDateLike,
  to: Temporal.PlainDateLike,
  {
    holidays = [],
    vacations = [],
    capacity = "PT40H",
    businessDays = [1, 2, 3, 4, 5],
  }: {
    holidays?: HolidayState[];
    vacations?: VacationState[];
    capacity?: Temporal.DurationLike;
    businessDays?: number[];
  } = {},
) {
  let date = Temporal.PlainDate.from(from);
  const end = Temporal.PlainDate.from(to);
  const weeklyCapacity = Temporal.Duration.from(capacity);
  let count = Temporal.Duration.from("PT0H");
  const hoursPerDay = Temporal.Duration.from({
    seconds: Math.round(weeklyCapacity.total("seconds") / businessDays.length),
  });
  while (Temporal.PlainDate.compare(date, end) <= 0) {
    if (isBusinessDay(businessDays, date)) {
      let hours = hoursPerDay;

      const holiday = findHoliday(holidays, date);
      if (holiday != null) {
        hours = hours.subtract(holiday.duration ?? hoursPerDay);
      }

      const vacation = findVacation(vacations, date);
      if (vacation != null) {
        hours = hours.subtract(vacation.duration ?? hoursPerDay);
      }

      count = count.add(hours);
    }
    date = date.add({ days: 1 });
  }
  return normalizeDuration(count);
}

function isBusinessDay(
  businessDays: number[],
  date: Temporal.PlainDateLike,
): boolean {
  const plainDate = Temporal.PlainDate.from(date);
  return businessDays.includes(plainDate.dayOfWeek);
}

function findHoliday(
  holidays: HolidayState[],
  date: Temporal.PlainDateLike,
): HolidayState | undefined {
  return holidays.find(
    (holiday) => Temporal.PlainDate.compare(holiday.date, date) === 0,
  );
}

function findVacation(
  vacations: VacationState[],
  date: Temporal.PlainDateLike,
): VacationState | undefined {
  return vacations.find(
    (vacation) => Temporal.PlainDate.compare(vacation.date, date) === 0,
  );
}
