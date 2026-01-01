// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import type { FluxStandardActionAuto } from "flux-standard-action";

import { normalizeDuration } from "../../shared/common/temporal";

export interface ActivityTemplate {
  client: string;
  project: string;
  task: string;
  notes?: string;
  category?: string;
}

//
// Actions and Action Creators
//

const CHANGE_TEXT_ACTION = "changeText";

interface ChangeTextPayload {
  name: keyof ActivityTemplate;
  text: string;
}

export function changeText(
  payload: ChangeTextPayload,
): FluxStandardActionAuto<typeof CHANGE_TEXT_ACTION, ChangeTextPayload> {
  return { type: CHANGE_TEXT_ACTION, payload };
}

const ACTIVITY_LOGGED_ACTION = "activityLogged";

export function activityLogged(): FluxStandardActionAuto<
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
  category?: string;
}

export function activitySelected(
  payload: ActivitySelectedPayload,
): FluxStandardActionAuto<typeof ACTIVITY_SELECTED, ActivitySelectedPayload> {
  return { type: ACTIVITY_SELECTED, payload };
}

const TIMER_STARTED_ACTION = "timerStarted";

interface TimerStartedPayload {
  timestamp: Temporal.Instant | string;
  interval: Temporal.DurationLike | string;
}

export function timerStarted(
  payload: TimerStartedPayload,
): FluxStandardActionAuto<typeof TIMER_STARTED_ACTION, TimerStartedPayload> {
  return { type: TIMER_STARTED_ACTION, payload };
}

const TIMER_TICKED_ACTION = "timerTicked";

interface TimerTickedPayload {
  timestamp: Temporal.Instant | string;
}

export function timerTicked(
  payload: TimerTickedPayload,
): FluxStandardActionAuto<typeof TIMER_TICKED_ACTION, TimerTickedPayload> {
  return { type: TIMER_TICKED_ACTION, payload };
}

const TIMER_STOPPED_ACTION = "timerStopped";

interface TimerStoppedPayload {
  timestamp: Temporal.Instant | string;
}

export function timerStopped(
  payload: TimerStoppedPayload,
): FluxStandardActionAuto<typeof TIMER_STOPPED_ACTION, TimerStoppedPayload> {
  return { type: TIMER_STOPPED_ACTION, payload };
}

const INTERVAL_ELAPSED_ACTION = "intervalElapsed";

interface IntervalElapsedPayload {
  timestamp: Temporal.Instant | string;
  interval: Temporal.DurationLike | string;
}

export function intervalElapsed(
  payload: IntervalElapsedPayload,
): FluxStandardActionAuto<
  typeof INTERVAL_ELAPSED_ACTION,
  IntervalElapsedPayload
> {
  return { type: INTERVAL_ELAPSED_ACTION, payload };
}

export type Action =
  | ReturnType<typeof changeText>
  | ReturnType<typeof activityLogged>
  | ReturnType<typeof activitySelected>
  | ReturnType<typeof timerStarted>
  | ReturnType<typeof timerTicked>
  | ReturnType<typeof timerStopped>
  | ReturnType<typeof intervalElapsed>;

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
    category: string;
    isLogButtonDisabled: boolean;
  };
  countdown: {
    interval: Temporal.Duration;
    remaining: Temporal.Duration;
    percentage: number;
    isRunning: boolean;
    end: Temporal.Instant;
  };
  currentInterval: Temporal.Duration;
}

export const initialState: State = {
  form: {
    isDisabled: false,
    client: "",
    project: "",
    task: "",
    notes: "",
    category: "",
    isLogButtonDisabled: true,
  },
  countdown: {
    interval: Temporal.Duration.from("PT30M"),
    remaining: Temporal.Duration.from("PT30M"),
    percentage: 0,
    isRunning: false,
    end: Temporal.Instant.fromEpochMilliseconds(0),
  },
  currentInterval: Temporal.Duration.from("PT30M"),
};

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
          interval: Temporal.Duration.from(action.payload.interval),
          remaining: Temporal.Duration.from(action.payload.interval),
          percentage: 0,
          isRunning: true,
          end: Temporal.Instant.from(action.payload.timestamp).add(
            action.payload.interval,
          ),
        },
      };
    case TIMER_TICKED_ACTION: {
      let remaining = state.countdown.end.since(action.payload.timestamp);
      if (remaining.sign === -1) {
        remaining = Temporal.Duration.from("PT0S");
      }
      remaining = normalizeDuration(remaining, "seconds");

      const interval = state.countdown.interval;
      const elapsed = interval.subtract(remaining);
      const newPercentage =
        (elapsed.total("seconds") / interval.total("seconds")) * 100;
      return {
        ...state,
        countdown: {
          ...state.countdown,
          remaining,
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
          interval: Temporal.Duration.from(action.payload.interval),
          remaining: Temporal.Duration.from(action.payload.interval),
          percentage: 0,
          end: Temporal.Instant.from(action.payload.timestamp).add(
            action.payload.interval,
          ),
        },
        currentInterval: Temporal.Duration.from(action.payload.interval),
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
