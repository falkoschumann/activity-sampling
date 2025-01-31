// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Activity, TimeSummary, WorkingDay } from "../domain/model";

export interface RecentActivitiesQueryResult {
  readonly lastActivity?: Activity;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
}
