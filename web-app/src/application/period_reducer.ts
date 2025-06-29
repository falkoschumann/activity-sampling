// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import type { PayloadAction } from "@reduxjs/toolkit";

import { PeriodUnit } from "../domain/activities";

export interface PeriodState {
  from: string;
  to: string;
  unit: PeriodUnit;
  isCurrent: boolean;
}

export function initialPeriodState(
  unit: PeriodUnit,
  today?: Temporal.PlainDate | string,
): PeriodState {
  today =
    today != null
      ? Temporal.PlainDate.from(today)
      : Temporal.Now.plainDateISO();
  let from: Temporal.PlainDate;
  let to: Temporal.PlainDate;
  if (unit === PeriodUnit.DAY) {
    from = today;
    to = today;
  } else if (unit === PeriodUnit.WEEK) {
    from = today.subtract({ days: today.dayOfWeek - 1 });
    to = from.add({ days: 6 });
  } else if (unit === PeriodUnit.MONTH) {
    from = today.with({ day: 1 });
    to = from.add({ months: 1 }).subtract({
      days: 1,
    });
  } else if (unit === PeriodUnit.YEAR) {
    from = today.with({ month: 1, day: 1 });
    to = today.with({ month: 12, day: 31 });
  } else {
    // All the time
    from = Temporal.PlainDate.from("0000-01-01");
    to = Temporal.PlainDate.from("9999-12-31");
  }
  return { from: from.toString(), to: to.toString(), unit, isCurrent: true };
}

export function changePeriod(
  state: { period: PeriodState },
  action: PayloadAction<{
    unit: PeriodUnit;
    today?: Temporal.PlainDate | string;
  }>,
) {
  state.period = initialPeriodState(action.payload.unit, action.payload.today);
}

export function nextPeriod(
  state: { period: PeriodState },
  action: PayloadAction<{ today?: Temporal.PlainDate | string }>,
) {
  let from = Temporal.PlainDate.from(state.period.from);
  let to = Temporal.PlainDate.from(state.period.to);
  const unit = state.period.unit;
  if (unit === PeriodUnit.DAY) {
    from = from.add({ days: 1 });
    to = to.add({ days: 1 });
  } else if (unit === PeriodUnit.WEEK) {
    from = from.add({ weeks: 1 });
    to = to.add({ weeks: 1 });
  } else if (unit === PeriodUnit.MONTH) {
    from = from.add({ months: 1 });
    to = to.add({ months: 1 }).with({ day: 31 });
  } else if (unit === PeriodUnit.YEAR) {
    from = from.add({ years: 1 }).with({ month: 1, day: 1 });
    to = from.with({ month: 12, day: 31 });
  }
  state.period = {
    from: from.toString(),
    to: to.toString(),
    unit,
    isCurrent: getCurrent(from, to, action.payload.today),
  };
}

export function previousPeriod(
  state: { period: PeriodState },
  action: PayloadAction<{
    today?: Temporal.PlainDate | string;
  }>,
) {
  let from = Temporal.PlainDate.from(state.period.from);
  let to = Temporal.PlainDate.from(state.period.to);
  const unit = state.period.unit;
  if (unit === PeriodUnit.DAY) {
    from = from.subtract({ days: 1 });
    to = to.subtract({ days: 1 });
  } else if (unit === PeriodUnit.WEEK) {
    from = from.subtract({ weeks: 1 });
    to = to.subtract({ weeks: 1 });
  } else if (unit === PeriodUnit.MONTH) {
    from = from.subtract({ months: 1 });
    to = to.subtract({ months: 1 }).with({ day: 31 });
  } else if (unit === PeriodUnit.YEAR) {
    from = from.subtract({ years: 1 }).with({ month: 1, day: 1 });
    to = to.subtract({ years: 1 }).with({ month: 12, day: 31 });
  }
  state.period = {
    from: from.toString(),
    to: to.toString(),
    unit,
    isCurrent: getCurrent(from, to, action.payload.today),
  };
}

function getCurrent(
  from: Temporal.PlainDate,
  to: Temporal.PlainDate,
  today?: Temporal.PlainDate | string,
): boolean {
  today =
    today != null
      ? Temporal.PlainDate.from(today)
      : Temporal.Now.plainDateISO();
  return (
    Temporal.PlainDate.compare(from, today) <= 0 &&
    Temporal.PlainDate.compare(today, to) <= 0
  );
}

export default {
  changePeriod,
  nextPeriod,
  previousPeriod,
};
