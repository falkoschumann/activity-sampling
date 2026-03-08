// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type Dispatch, useEffect, useRef } from "react";

import {
  type Action,
  intervalElapsed,
  timerStarted,
  timerStopped,
  timerTicked,
} from "../domain/log";
import { NotificationGateway } from "../infrastructure/notification_gateway";
import type {
  IntervalElapsedEventDto,
  TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../../shared/infrastructure/timer";
import { Temporal } from "@js-temporal/polyfill";

export function useCurrentInterval(dispatch: Dispatch<Action>) {
  const timeoutId =
    useRef<ReturnType<typeof globalThis.setInterval>>(undefined);

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (event: TimerStartedEventDto) => {
        clearInterval(timeoutId.current);
        timeoutId.current = setInterval(
          () =>
            dispatch(
              timerTicked({
                timestamp: Temporal.Now.instant(),
              }),
            ),
          1000,
        );
        dispatch(timerStarted(event));
      },
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (event: TimerStoppedEventDto) => {
        clearInterval(timeoutId.current);
        dispatch(timerStopped(event));
      },
    );

    const offIntervalElapsedEvent =
      window.activitySampling.onIntervalElapsedEvent(
        (event: IntervalElapsedEventDto) => {
          dispatch(intervalElapsed(event));
          NotificationGateway.getInstance().hide();
          NotificationGateway.getInstance().show();
        },
      );

    return () => {
      offTimerStartedEvent();
      offTimerStoppedEvent();
      offIntervalElapsedEvent();
    };
  }, [dispatch, timeoutId]);
}
