// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface ActivityTemplate {
  client: string;
  project: string;
  task: string;
  notes?: string;
}

//
// Actions and Action Creators
//

import { Temporal } from "@js-temporal/polyfill";

import type { FluxStandardAction } from "../common/reducer";

const CHANGE_TEXT_ACTION = "changeText";

interface ChangeTextPayload {
  name: "client" | "project" | "task" | "notes";
  text: string;
}

export function changeText(
  payload: ChangeTextPayload,
): FluxStandardAction<typeof CHANGE_TEXT_ACTION, ChangeTextPayload> {
  return { type: CHANGE_TEXT_ACTION, payload };
}

const ACTIVITY_LOGGED_ACTION = "activityLogged";

export function activityLogged(): FluxStandardAction<
  typeof ACTIVITY_LOGGED_ACTION
> {
  return { type: ACTIVITY_LOGGED_ACTION, payload: undefined };
}

const ACTIVITY_SELECTED = "activitySelected";

interface ActivitySelectedPayload {
  client: string;
  project: string;
  task: string;
  notes?: string;
}

export function activitySelected(
  payload: ActivitySelectedPayload,
): FluxStandardAction<typeof ACTIVITY_SELECTED, ActivitySelectedPayload> {
  return { type: ACTIVITY_SELECTED, payload };
}

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

export function timerStopped(): FluxStandardAction<
  typeof TIMER_STOPPED_ACTION
> {
  return { type: TIMER_STOPPED_ACTION, payload: undefined };
}

const INTERVAL_ELAPSED_ACTION = "intervalElapsed";

interface IntervalElapsedPayload {
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
  form: {
    isDisabled: boolean;
    client: string;
    project: string;
    task: string;
    notes: string;
    isLogButtonDisabled: boolean;
  };
  countdown: {
    interval: string;
    remaining: string;
    percentage: number;
    isRunning: boolean;
  };
  currentInterval: string;
}

export const initialState: State = {
  form: {
    isDisabled: false,
    client: "",
    project: "",
    task: "",
    notes: "",
    isLogButtonDisabled: true,
  },
  countdown: {
    interval: "PT30M",
    remaining: "PT30M",
    percentage: 0,
    isRunning: false,
  },
  currentInterval: "PT30M",
};

export type Action =
  | ReturnType<typeof changeText>
  | ReturnType<typeof activityLogged>
  | ReturnType<typeof activitySelected>
  | ReturnType<typeof timerStarted>
  | ReturnType<typeof timerTicked>
  | ReturnType<typeof timerStopped>
  | ReturnType<typeof intervalElapsed>;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CHANGE_TEXT_ACTION: {
      state = {
        ...state,
        form: {
          ...state.form,
          [action.payload.name]: action.payload.text,
        },
      };
      state.form.isLogButtonDisabled = isLogButtonDisabled(state);
      return state;
    }
    case ACTIVITY_LOGGED_ACTION: {
      if (!state.countdown.isRunning) {
        return state;
      }
      return {
        ...state,
        form: {
          ...state.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
      };
    }
    case ACTIVITY_SELECTED:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
          notes: action.payload.notes ? action.payload.notes : "",
          isLogButtonDisabled: isLogButtonDisabled(state),
        },
      };
    case TIMER_STARTED_ACTION:
      return {
        ...state,
        form: {
          ...state.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...state.countdown,
          interval: action.payload.interval,
          remaining: action.payload.interval,
          percentage: 0,
          isRunning: true,
        },
      };
    case TIMER_TICKED_ACTION: {
      const duration = Temporal.Duration.from(action.payload.duration);
      const previousRemaining = Temporal.Duration.from(
        state.countdown.remaining,
      );
      const newRemaining = previousRemaining.subtract(duration);

      const interval = Temporal.Duration.from(state.countdown.interval);
      const elapsed = interval.subtract(newRemaining);
      const newPercentage =
        (elapsed.total("seconds") / interval.total("seconds")) * 100;
      return {
        ...state,
        countdown: {
          ...state.countdown,
          remaining:
            newRemaining.total("seconds") < 0
              ? "PT0S"
              : newRemaining.toString(),
          percentage: newPercentage > 100 ? 100 : newPercentage,
        },
      };
    }
    case TIMER_STOPPED_ACTION:
      return {
        ...state,
        form: {
          ...state.form,
          isDisabled: false,
          isLogButtonDisabled: isLogButtonDisabled(state),
        },
        countdown: {
          ...state.countdown,
          isRunning: false,
        },
      };
    case INTERVAL_ELAPSED_ACTION:
      return {
        ...state,
        form: {
          ...state.form,
          isDisabled: false,
          isLogButtonDisabled: isLogButtonDisabled(state),
        },
        countdown: {
          ...state.countdown,
          interval: action.payload.interval,
          remaining: action.payload.interval,
          percentage: 0,
        },
        currentInterval: action.payload.interval,
      };
  }

  // @ts-expect-error: code is unreachable if all action types are handled
  throw new Error(`Unknown action in timer reducer: ${action.type}.`);
}

function isLogButtonDisabled(state: State): boolean {
  return (
    !state.form.client.trim() ||
    !state.form.project.trim() ||
    !state.form.task.trim()
  );
}
