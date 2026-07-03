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
  readonly elapsedTime: Temporal.DurationLike;
  readonly progress: number;
}

export function createGetCurrentIntervalQueryResult({
  isRunning = false,
  elapsedTime = "PT0S",
  progress = 0,
}: {
  isRunning?: boolean;
  elapsedTime?: Temporal.DurationLike;
  progress?: number;
} = {}): GetCurrentIntervalQueryResult {
  return {
    isRunning,
    elapsedTime,
    progress,
  };
}

export function getCurrentInterval(
  view: TimerView,
  _query: GetCurrentIntervalQuery,
): GetCurrentIntervalQueryResult {
  return createGetCurrentIntervalQueryResult(view);
}
