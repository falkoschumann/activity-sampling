// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import {
  IntervalElapsedEventDto,
  type TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../../shared/infrastructure/timer";

export function useTimer() {
  // TODO Replace with reducer and write tests
  const [remaining, setRemaining] = useState(Temporal.Duration.from("PT30M"));
  const [percentage, setPercentage] = useState(0);
  const [timeoutId, setTimeoutId] =
    useState<ReturnType<typeof globalThis.setInterval>>();

  useEffect(() => {
    const offTimerStartedEvent = window.activitySampling.onTimerStartedEvent(
      (event: TimerStartedEventDto) => {
        console.info(`Timer started: ${event.interval}`);
        clearInterval(timeoutId);

        const interval = Temporal.Duration.from(event.interval);
        setRemaining(interval);
        setPercentage(0);

        const id = setInterval(() => {
          setRemaining((prevRemaining) => {
            const newRemaining = prevRemaining.subtract("PT1S");
            const elapsed = interval.subtract(newRemaining);
            const newPercentage =
              (elapsed.total("seconds") / interval.total("seconds")) * 100;
            setPercentage(newPercentage > 100 ? 100 : newPercentage);
            return newRemaining;
          });
        }, 1000);
        setTimeoutId(id);
      },
    );

    const offTimerStoppedEvent = window.activitySampling.onTimerStoppedEvent(
      (_event: TimerStoppedEventDto) => {
        console.info("Timer stopped event.");
        clearInterval(timeoutId);
      },
    );

    const offIntervalElapsedEvent =
      window.activitySampling.onIntervalElapsedEvent(
        (event: IntervalElapsedEventDto) => {
          console.info(`Interval elapsed event: ${event.interval}`);
        },
      );

    return () => {
      offTimerStartedEvent();
      offTimerStoppedEvent();
      offIntervalElapsedEvent();
    };
  }, [percentage, remaining, timeoutId]);

  return { remaining, percentage };
}
