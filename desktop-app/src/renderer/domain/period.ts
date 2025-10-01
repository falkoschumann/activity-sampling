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

const GO_TO_NEXT_PERIOD_ACTION = "goToNextPeriod";

interface GoToNextPeriodPayload {
  today?: Temporal.PlainDate | string;
}

export function goToNextPeriod(
  payload: GoToNextPeriodPayload,
): FluxStandardAction<typeof GO_TO_NEXT_PERIOD_ACTION, GoToNextPeriodPayload> {
  return { type: GO_TO_NEXT_PERIOD_ACTION, payload };
}

const GO_TO_PREVIOUS_PERIOD_ACTION = "goToPreviousPeriod";

interface GoToPreviousPeriodPayload {
  today?: Temporal.PlainDate | string;
}

export function goToPreviousPeriod(
  payload: GoToPreviousPeriodPayload,
): FluxStandardAction<
  typeof GO_TO_PREVIOUS_PERIOD_ACTION,
  GoToPreviousPeriodPayload
> {
  return { type: GO_TO_PREVIOUS_PERIOD_ACTION, payload };
}

const CHANGE_PERIOD_ACTION = "changePeriod";

interface ChangePeriodPayload {
  unit: PeriodUnit;
  today?: Temporal.PlainDate | string;
}

export function changePeriod(
  payload: ChangePeriodPayload,
): FluxStandardAction<typeof CHANGE_PERIOD_ACTION, ChangePeriodPayload> {
  return { type: CHANGE_PERIOD_ACTION, payload };
}

export type Action =
  | ReturnType<typeof goToNextPeriod>
  | ReturnType<typeof goToPreviousPeriod>
  | ReturnType<typeof changePeriod>;

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
  today?: Temporal.PlainDate | string;
  unit: PeriodUnit;
}): State {
  today = parseToday(today);
  let from: Temporal.PlainDate;
  let to: Temporal.PlainDate;
  switch (unit) {
    case PeriodUnit.DAY:
      from = today;
      to = today;
      break;
    case PeriodUnit.WEEK:
      from = today.subtract({ days: today.dayOfWeek - 1 });
      to = today.add({ days: 7 - today.dayOfWeek });
      break;
    case PeriodUnit.MONTH:
      from = today.with({ day: 1 });
      to = today.with({ day: 31 });
      break;
    case PeriodUnit.YEAR:
      from = today.with({ month: 1, day: 1 });
      to = today.with({ month: 12, day: 31 });
      break;
    default:
      // All the time
      from = Temporal.PlainDate.from("0000-01-01");
      to = Temporal.PlainDate.from("9999-12-31");
      break;
  }

  return {
    from: from.toString(),
    to: to.toString(),
    unit,
    isCurrent: true,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case GO_TO_NEXT_PERIOD_ACTION: {
      let from = Temporal.PlainDate.from(state.from);
      let to = Temporal.PlainDate.from(state.to);
      switch (state.unit) {
        case PeriodUnit.DAY:
          from = from.add({ days: 1 });
          to = to.add({ days: 1 });
          break;
        case PeriodUnit.WEEK:
          from = from.add({ days: 7 });
          to = to.add({ days: 7 });
          break;
        case PeriodUnit.MONTH:
          from = from.add({ months: 1 });
          to = to.add({ months: 1 }).with({ day: 31 });
          break;
        case PeriodUnit.YEAR:
          from = from.add({ years: 1 }).with({ month: 1, day: 1 });
          to = from.with({ month: 12, day: 31 });
      }
      return {
        ...state,
        from: from.toString(),
        to: to.toString(),
        isCurrent: getCurrent(from, to, action.payload.today),
      };
    }
    case GO_TO_PREVIOUS_PERIOD_ACTION: {
      let from = Temporal.PlainDate.from(state.from);
      let to = Temporal.PlainDate.from(state.to);
      switch (state.unit) {
        case PeriodUnit.DAY:
          from = from.subtract({ days: 1 });
          to = to.subtract({ days: 1 });
          break;
        case PeriodUnit.WEEK:
          from = from.subtract({ days: 7 });
          to = to.subtract({ days: 7 });
          break;
        case PeriodUnit.MONTH:
          from = from.subtract({ months: 1 });
          to = to.subtract({ months: 1 }).with({ day: 31 });
          break;
        case PeriodUnit.YEAR:
          from = from.subtract({ years: 1 }).with({ month: 1, day: 1 });
          to = to.subtract({ years: 1 }).with({ month: 12, day: 31 });
      }
      return {
        ...state,
        from: from.toString(),
        to: to.toString(),
        isCurrent: getCurrent(from, to, action.payload.today),
      };
    }
    case CHANGE_PERIOD_ACTION:
      return init({ unit: action.payload.unit, today: action.payload.today });
  }

  // @ts-expect-error: code is unreachable if all action types are handled
  throw new Error(`Unknown action in timer reducer: ${action.type}.`);
}

function getCurrent(
  from: Temporal.PlainDate,
  to: Temporal.PlainDate,
  today?: Temporal.PlainDate | string,
): boolean {
  today = parseToday(today);
  return (
    Temporal.PlainDate.compare(from, today) <= 0 &&
    Temporal.PlainDate.compare(today, to) <= 0
  );
}

function parseToday(today?: Temporal.PlainDate | string): Temporal.PlainDate {
  today =
    today != null
      ? Temporal.PlainDate.from(today)
      : Temporal.Now.plainDateISO();
  return today;
}
