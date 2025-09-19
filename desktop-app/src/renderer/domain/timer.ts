// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

//
// Actions and Action Creators
//

import { Temporal } from "@js-temporal/polyfill";

import type { FluxStandardAction } from "../common/reducer";

const TIMER_STARTED_ACTION = "timerStarted";

interface TimerStartedPayload {
  interval: string;
}

export function timerStarted(
  payload: TimerStartedPayload,
): FluxStandardAction<typeof TIMER_STARTED_ACTION, TimerStartedPayload> {
  return { type: TIMER_STARTED_ACTION, payload };
}

const TIMER_TICKED_ACTION = "timerTicked";

interface TimerTickedPayload {
  duration: string;
}

export function timerTicked(
  payload: TimerTickedPayload,
): FluxStandardAction<typeof TIMER_TICKED_ACTION, TimerTickedPayload> {
  return { type: TIMER_TICKED_ACTION, payload };
}

const TIMER_STOPPED_ACTION = "timerStopped";

// timer stopped has no payload

export function timerStopped(): FluxStandardAction<
  typeof TIMER_STOPPED_ACTION
> {
  return { type: TIMER_STOPPED_ACTION, payload: undefined };
}

const INTERVAL_ELAPSED_ACTION = "intervalElapsed";

interface IntervalElapsedPayload {
  timestamp: string;
  interval: string;
}

export function intervalElapsed(
  payload: IntervalElapsedPayload,
): FluxStandardAction<typeof INTERVAL_ELAPSED_ACTION, IntervalElapsedPayload> {
  return { type: INTERVAL_ELAPSED_ACTION, payload };
}

//
// State and Reducer
//

export interface State {
  interval: string;
  remaining: string;
  percentage: number;
}

export const initialState: State = {
  interval: "PT30M",
  remaining: "PT30M",
  percentage: 0,
};

export type Action =
  | ReturnType<typeof timerStarted>
  | ReturnType<typeof timerTicked>
  | ReturnType<typeof timerStopped>
  | ReturnType<typeof intervalElapsed>;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case TIMER_STARTED_ACTION:
      return {
        ...state,
        interval: action.payload.interval,
        remaining: action.payload.interval,
        percentage: 0,
      };
    case TIMER_TICKED_ACTION: {
      const duration = Temporal.Duration.from(action.payload.duration);
      const previousRemaining = Temporal.Duration.from(state.remaining);
      const newRemaining = previousRemaining.subtract(duration);

      const interval = Temporal.Duration.from(state.interval);
      const elapsed = interval.subtract(newRemaining);
      const newPercentage =
        (elapsed.total("seconds") / interval.total("seconds")) * 100;
      return {
        ...state,
        remaining:
          newRemaining.total("seconds") < 0 ? "PT0S" : newRemaining.toString(),
        percentage: newPercentage > 100 ? 100 : newPercentage,
      };
    }
    case TIMER_STOPPED_ACTION:
      return state;
    case INTERVAL_ELAPSED_ACTION:
      return {
        ...state,
        remaining: state.interval,
        percentage: 0,
      };
  }

  assertUnreachable(action);
}

function assertUnreachable(action: never): never {
  // @ts-expect-error: code is unreachable if all action types are handled above
  throw new Error(`Unknown action in timer reducer: ${action.type}.`);
}
