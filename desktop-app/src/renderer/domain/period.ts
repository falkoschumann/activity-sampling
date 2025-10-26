// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import type { FluxStandardActionAuto } from "flux-standard-action";

export const PeriodUnit = Object.freeze({
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  QUARTER: "Quarter",
  HALF_YEAR: "Half year",
  YEAR: "Year",
  ALL_TIME: "All time",
});

export type PeriodUnitType = (typeof PeriodUnit)[keyof typeof PeriodUnit];

//
// Actions and Action Creators
//

const GO_TO_NEXT_PERIOD_ACTION = "goToNextPeriod";

interface GoToNextPeriodPayload {
  today?: Temporal.PlainDateLike | string;
}

export function goToNextPeriod(
  payload: GoToNextPeriodPayload,
): FluxStandardActionAuto<
  typeof GO_TO_NEXT_PERIOD_ACTION,
  GoToNextPeriodPayload
> {
  return { type: GO_TO_NEXT_PERIOD_ACTION, payload };
}

const GO_TO_PREVIOUS_PERIOD_ACTION = "goToPreviousPeriod";

interface GoToPreviousPeriodPayload {
  today?: Temporal.PlainDateLike | string;
}

export function goToPreviousPeriod(
  payload: GoToPreviousPeriodPayload,
): FluxStandardActionAuto<
  typeof GO_TO_PREVIOUS_PERIOD_ACTION,
  GoToPreviousPeriodPayload
> {
  return { type: GO_TO_PREVIOUS_PERIOD_ACTION, payload };
}

const CHANGE_PERIOD_ACTION = "changePeriod";

interface ChangePeriodPayload {
  unit: PeriodUnitType;
  today?: Temporal.PlainDateLike | string;
}

export function changePeriod(
  payload: ChangePeriodPayload,
): FluxStandardActionAuto<typeof CHANGE_PERIOD_ACTION, ChangePeriodPayload> {
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
  from: Temporal.PlainDate;
  to: Temporal.PlainDate;
  unit: PeriodUnitType;
  isCurrent: boolean;
}

export function init({
  today,
  unit,
}: {
  today?: Temporal.PlainDateLike | string;
  unit: PeriodUnitType;
}): State {
  const todayDate = parseToday(today);
  let from: Temporal.PlainDate;
  let to: Temporal.PlainDate;
  switch (unit) {
    case PeriodUnit.DAY:
      from = todayDate;
      to = todayDate;
      break;
    case PeriodUnit.WEEK:
      from = todayDate.subtract({ days: todayDate.dayOfWeek - 1 });
      to = todayDate.add({ days: 7 - todayDate.dayOfWeek });
      break;
    case PeriodUnit.MONTH:
      from = todayDate.with({ day: 1 });
      to = todayDate.with({ day: 31 });
      break;
    case PeriodUnit.QUARTER:
      if (todayDate.month <= 3) {
        from = todayDate.with({ month: 1, day: 1 });
        to = todayDate.with({ month: 3, day: 31 });
      } else if (todayDate.month <= 6) {
        from = todayDate.with({ month: 4, day: 1 });
        to = todayDate.with({ month: 6, day: 30 });
      } else if (todayDate.month <= 9) {
        from = todayDate.with({ month: 7, day: 1 });
        to = todayDate.with({ month: 9, day: 30 });
      } else {
        from = todayDate.with({ month: 10, day: 1 });
        to = todayDate.with({ month: 12, day: 31 });
      }
      break;
    case PeriodUnit.HALF_YEAR:
      from =
        todayDate.month <= 6
          ? todayDate.with({ month: 1, day: 1 })
          : todayDate.with({ month: 7, day: 1 });
      to =
        todayDate.month <= 6
          ? todayDate.with({ month: 6, day: 30 })
          : todayDate.with({ month: 12, day: 31 });
      break;
    case PeriodUnit.YEAR:
      from = todayDate.with({ month: 1, day: 1 });
      to = todayDate.with({ month: 12, day: 31 });
      break;
    default:
      // All the time
      from = Temporal.PlainDate.from("0000-01-01");
      to = Temporal.PlainDate.from("9999-12-31");
      break;
  }

  return {
    from,
    to,
    unit,
    isCurrent: true,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case GO_TO_NEXT_PERIOD_ACTION: {
      let from = state.from;
      let to = state.to;
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
        case PeriodUnit.QUARTER:
          from = from.add({ months: 3 });
          to = to.add({ months: 3 }).with({ day: 31 });
          break;
        case PeriodUnit.HALF_YEAR:
          from = from.add({ months: 6 });
          to = to.add({ months: 6 }).with({ day: 31 });
          break;
        case PeriodUnit.YEAR:
          from = from.add({ years: 1 }).with({ month: 1, day: 1 });
          to = from.with({ month: 12, day: 31 });
      }
      return {
        ...state,
        from,
        to,
        isCurrent: getCurrent(from, to, action.payload.today),
      };
    }
    case GO_TO_PREVIOUS_PERIOD_ACTION: {
      let from = state.from;
      let to = state.to;
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
        case PeriodUnit.QUARTER:
          from = from.subtract({ months: 3 });
          to = to.subtract({ months: 3 }).with({ day: 31 });
          break;
        case PeriodUnit.HALF_YEAR:
          from = from.subtract({ months: 6 });
          to = to.subtract({ months: 6 }).with({ day: 31 });
          break;
        case PeriodUnit.YEAR:
          from = from.subtract({ years: 1 }).with({ month: 1, day: 1 });
          to = to.subtract({ years: 1 }).with({ month: 12, day: 31 });
      }
      return {
        ...state,
        from,
        to,
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
  from: Temporal.PlainDateLike,
  to: Temporal.PlainDateLike,
  today?: Temporal.PlainDateLike | string,
): boolean {
  today = parseToday(today);
  return (
    Temporal.PlainDate.compare(from, today) <= 0 &&
    Temporal.PlainDate.compare(today, to) <= 0
  );
}

function parseToday(
  today?: Temporal.PlainDateLike | string,
): Temporal.PlainDate {
  return today != null
    ? Temporal.PlainDate.from(today)
    : Temporal.Now.plainDateISO();
}
