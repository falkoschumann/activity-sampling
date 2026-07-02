// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimerView } from "./timer.read_model";

export class GetCurrentIntervalQuery {
  static create(_data = null) {
    return new GetCurrentIntervalQuery();
  }

  readonly type = "get-current-interval";
  readonly data = null;

  private constructor() {}
}

export class GetCurrentIntervalQueryResult {
  static create({
    isRunning = false,
    elapsedTime = Temporal.Duration.from("PT0S"),
    progress = 0,
  }: {
    isRunning?: boolean;
    elapsedTime?: Temporal.DurationLike;
    progress?: number;
  } = {}) {
    return new GetCurrentIntervalQueryResult(isRunning, elapsedTime, progress);
  }

  readonly isRunning: boolean;
  readonly elapsedTime: Temporal.Duration;
  readonly progress: number;

  private constructor(
    isRunning: boolean,
    elapsedTime: Temporal.DurationLike,
    progress: number,
  ) {
    this.isRunning = isRunning;
    this.elapsedTime = Temporal.Duration.from(elapsedTime);
    this.progress = progress;
  }
}

export function getCurrentInterval(
  view: TimerView,
  _query: GetCurrentIntervalQuery,
): GetCurrentIntervalQueryResult {
  return GetCurrentIntervalQueryResult.create(view);
}
