// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useReducer, useState } from "react";

import {
  IntervalElapsedEventDto,
  type TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../../shared/infrastructure/timer";
import {
  initialState,
  intervalElapsed,
  reducer,
  timerStarted,
  timerStopped,
  timerTicked,
} from "../domain/timer";

export function useCountdown() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [timeoutId, setTimeoutId] =
    useState<ReturnType<typeof globalThis.setInterval>>();

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (event: TimerStartedEventDto) => {
        clearInterval(timeoutId);
        const id = setInterval(
          () => dispatch(timerTicked({ duration: "PT1S" })),
          1000,
        );
        setTimeoutId(id);
        dispatch(timerStarted({ interval: event.interval }));
      },
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (_event: TimerStoppedEventDto) => {
        clearInterval(timeoutId);
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
