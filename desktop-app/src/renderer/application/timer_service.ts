// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

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

export function useCurrentInterval(dispatch: Dispatch<Action>) {
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
          dispatch(intervalElapsed({ interval: event.interval }));
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
