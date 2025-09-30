// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { FluxStandardAction } from "../common/reducer";

export const PeriodUnit = Object.freeze({
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  YEAR: "Year",
  ALL_TIME: "All time",
});

export type PeriodUnit = (typeof PeriodUnit)[keyof typeof PeriodUnit];

//
// Actions and Action Creators
//

export type Action = FluxStandardAction;

//
// State and Reducer
//

export interface State {
  from: string;
  to: string;
  unit: PeriodUnit;
  isCurrent: boolean;
}

export function init({
  today,
  unit,
}: {
  today: string;
  unit: PeriodUnit;
}): State {
  const todayDate = Temporal.PlainDate.from(today);
  if (unit === PeriodUnit.WEEK) {
    const from = todayDate.subtract({ days: todayDate.dayOfWeek - 1 });
    const to = todayDate.add({ days: 7 - todayDate.dayOfWeek });
    return {
      from: from.toString(),
      to: to.toString(),
      unit: unit,
      isCurrent: true,
    };
  }

  if (unit === PeriodUnit.MONTH) {
    const from = todayDate.with({ day: 1 });
    const to = todayDate.with({ day: 31 });
    return {
      from: from.toString(),
      to: to.toString(),
      unit: unit,
      isCurrent: true,
    };
  }

  throw new Error(`Unknown period in period initializer: ${unit}.`);
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    default:
      return state;
  }
}
