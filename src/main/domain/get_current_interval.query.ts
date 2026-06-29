// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { TimerView } from "./timer.read_model";
import {
  type GetCurrentIntervalQuery,
  GetCurrentIntervalQueryResult,
} from "../../shared/domain/get_current_interval.query";

export function getCurrentInterval(
  view: TimerView,
  _query: GetCurrentIntervalQuery,
): GetCurrentIntervalQueryResult {
  return GetCurrentIntervalQueryResult.create(view);
}
