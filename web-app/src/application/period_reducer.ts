// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { PayloadAction } from "@reduxjs/toolkit";

export type PeriodUnit = "Day" | "Week" | "Month";

export interface PeriodState {
  period: {
    from: string;
    to: string;
    unit: PeriodUnit;
  };
}

export function initPeriod(
  state: PeriodState,
  action: PayloadAction<{
    from: string;
    to: string;
    unit: PeriodUnit;
  }>,
) {
  state.period.from = action.payload.from;
  state.period.to = action.payload.to;
  state.period.unit = action.payload.unit;
}

export function changePeriod(
  state: PeriodState,
  action: PayloadAction<{ unit: PeriodUnit }>,
) {
  const { from } = state.period;
  const startDate = Temporal.PlainDate.from(from);
  if (action.payload.unit === "Day") {
    state.period.from = startDate.toString();
    state.period.to = startDate.toString();
    state.period.unit = "Day";
  } else if (action.payload.unit === "Week") {
    const monday = startDate.subtract({ days: startDate.dayOfWeek - 1 });
    const sunday = monday.add({ days: 6 });
    state.period.from = monday.toString();
    state.period.to = sunday.toString();
    state.period.unit = "Week";
  } else if (action.payload.unit === "Month") {
    const firstDayOfMonth = startDate.with({ day: 1 });
    const lastDayOfMonth = firstDayOfMonth.add({ months: 1 }).subtract({
      days: 1,
    });
    state.period.from = firstDayOfMonth.toString();
    state.period.to = lastDayOfMonth.toString();
    state.period.unit = "Month";
  }
}

export function nextPeriod(state: PeriodState) {
  const { from, to, unit } = state.period;
  const startDate = Temporal.PlainDate.from(from);
  const endDate = Temporal.PlainDate.from(to);
  if (unit === "Day") {
    state.period.from = startDate.add({ days: 1 }).toString();
    state.period.to = endDate.add({ days: 1 }).toString();
  } else if (unit === "Week") {
    state.period.from = startDate.add({ weeks: 1 }).toString();
    state.period.to = endDate.add({ weeks: 1 }).toString();
  } else if (unit === "Month") {
    state.period.from = startDate.add({ months: 1 }).toString();
    state.period.to = endDate.add({ months: 1 }).with({ day: 31 }).toString();
  }
}

export function previousPeriod(state: PeriodState) {
  const { from, to, unit } = state.period;
  const startDate = Temporal.PlainDate.from(from);
  const endDate = Temporal.PlainDate.from(to);
  if (unit === "Day") {
    state.period.from = startDate.subtract({ days: 1 }).toString();
    state.period.to = endDate.subtract({ days: 1 }).toString();
  } else if (unit === "Week") {
    state.period.from = startDate.subtract({ weeks: 1 }).toString();
    state.period.to = endDate.subtract({ weeks: 1 }).toString();
  } else if (unit === "Month") {
    state.period.from = startDate.subtract({ months: 1 }).toString();
    state.period.to = endDate
      .subtract({ months: 1 })
      .with({ day: 31 })
      .toString();
  }
}
