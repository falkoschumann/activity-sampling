// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useRef, useState } from "react";

import {
  initialState,
  intervalElapsed,
  reducer,
  timerStarted,
  timerStopped,
  timerTicked,
} from "../domain/timer";
import {
  IntervalElapsedEventDto,
  type TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../../shared/infrastructure/timer";

export function useCurrentInterval(): [
  boolean,
  (isFormDisabled: boolean) => void,
] {
  const [isFormDisabled, setFormDisabled] = useState(false);

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (_event: TimerStartedEventDto) => setFormDisabled(true),
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (_event: TimerStoppedEventDto) => setFormDisabled(false),
    );

    const offIntervalElapsedEvent =
      window.activitySampling.onIntervalElapsedEvent(
        (_event: IntervalElapsedEventDto) => setFormDisabled(false),
      );

    return () => {
      offTimerStartedEvent();
      offTimerStoppedEvent();
      offIntervalElapsedEvent();
    };
  }, []);

  return [isFormDisabled, setFormDisabled];
}

export function useCountdown() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timeoutId =
    useRef<ReturnType<typeof globalThis.setInterval>>(undefined);

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (event: TimerStartedEventDto) => {
        clearInterval(timeoutId.current);
        timeoutId.current = setInterval(
          () => dispatch(timerTicked({ duration: "PT1S" })),
          1000,
        );
        dispatch(timerStarted({ interval: event.interval }));
      },
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (_event: TimerStoppedEventDto) => {
        clearInterval(timeoutId.current);
        dispatch(timerStopped());
      },
    );

    const offIntervalElapsedEvent =
      window.activitySampling.onIntervalElapsedEvent(
        (event: IntervalElapsedEventDto) => {
          dispatch(
            intervalElapsed({
              timestamp: event.timestamp,
              interval: event.interval,
            }),
          );
        },
      );

    return () => {
      offTimerStartedEvent();
      offTimerStoppedEvent();
      offIntervalElapsedEvent();
    };
  }, [timeoutId]);

  return state;
}
