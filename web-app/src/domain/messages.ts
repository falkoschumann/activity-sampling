// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Activity, TimeSummary, WorkingDay } from "./activities.ts";
import { Duration } from "./duration.ts";

export interface LogActivityCommand {
  readonly timestamp: Date;
  readonly duration: Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes: string;
}

export interface CommandStatus {
  readonly success: boolean;
  readonly errorMessage?: string;
}

export interface RecentActivitiesQuery {
  readonly today?: Date;
}

export interface RecentActivitiesQueryResult {
  readonly lastActivity?: Activity;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
}
