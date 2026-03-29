// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type Dispatch, useEffect, useRef } from "react";

import { IntervalElapsedEvent } from "../../shared/domain/interval_elapsed_event";
import { TimerStartedEvent } from "../../shared/domain/timer_started_event";
import { TimerStoppedEvent } from "../../shared/domain/timer_stopped_event";
import {
  type Action,
  intervalElapsed,
  timerStarted,
  timerStopped,
  timerTicked,
} from "../domain/log";
import { NotificationGateway } from "../infrastructure/notification_gateway";

export function useCurrentInterval(dispatch: Dispatch<Action>) {
  const timeoutId =
    useRef<ReturnType<typeof globalThis.setInterval>>(undefined);

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (json) => {
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

        const dto = JSON.parse(json);
        const event = TimerStartedEvent.create(dto);
        dispatch(timerStarted(event));
      },
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (json) => {
        clearInterval(timeoutId.current);

        const dto = JSON.parse(json);
        const event = TimerStoppedEvent.create(dto);
        dispatch(timerStopped(event));
      },
    );

    const offIntervalElapsedEvent =
      window.activitySampling.onIntervalElapsedEvent((json) => {
        NotificationGateway.getInstance().hide();
        NotificationGateway.getInstance().show();

        const dto = JSON.parse(json);
        const event = IntervalElapsedEvent.create(dto);
        dispatch(intervalElapsed(event));
      });

    return () => {
      offTimerStartedEvent();
      offTimerStoppedEvent();
      offIntervalElapsedEvent();
    };
  }, [dispatch, timeoutId]);
}
