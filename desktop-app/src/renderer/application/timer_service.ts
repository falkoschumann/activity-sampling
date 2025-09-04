// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

import {
  type TimerStartedEventDto,
  TimerStoppedEventDto,
} from "../../shared/infrastructure/timer";

export function useTimer() {
  const [remaining, setRemaining] = useState(Temporal.Duration.from("PT30M"));
  const [percentage, setPercentage] = useState(0);

  // TODO start/stop countdown based on events

  useEffect(() => {
    window.activitySampling.onTimerStartedEvent(
      (event: TimerStartedEventDto) => {
        const interval = Temporal.Duration.from(event.interval);
        setRemaining(interval);
        setPercentage(0);
      },
    );

    window.activitySampling.onTimerStoppedEvent(
      (_event: TimerStoppedEventDto) => {},
    );

    window.activitySampling.onIntervalElapsedEvent(
      (_event: TimerStoppedEventDto) => {},
    );
  }, []);

  return { remaining, percentage };
}
