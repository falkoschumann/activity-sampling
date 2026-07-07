// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimerView } from "./timer.read_model";

export interface GetCurrentIntervalQuery {
  readonly type: "get-current-interval";
  readonly data: GetCurrentIntervalQueryData;
}

export type GetCurrentIntervalQueryData = null;

export function createGetCurrentIntervalQuery(
  data = null,
): GetCurrentIntervalQuery {
  return {
    type: "get-current-interval",
    data,
  };
}

export interface GetCurrentIntervalQueryResult {
  readonly isRunning: boolean;
  readonly interval: Temporal.DurationLike;
  readonly remainingTime: Temporal.DurationLike;
  readonly progress: number;
}

export function createGetCurrentIntervalQueryResult({
  isRunning = false,
  interval = "PT30M",
  remainingTime = "PT30M",
  progress = 0,
}: {
  isRunning?: boolean;
  interval?: Temporal.DurationLike;
  remainingTime?: Temporal.DurationLike;
  progress?: number;
} = {}): GetCurrentIntervalQueryResult {
  return {
    isRunning,
    interval,
    remainingTime,
    progress,
  };
}

export function getCurrentInterval(
  view: TimerView,
  _query: GetCurrentIntervalQuery,
): GetCurrentIntervalQueryResult {
  return createGetCurrentIntervalQueryResult(view);
}
