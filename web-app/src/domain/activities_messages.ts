// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Activity, TimeSummary, WorkingDay } from "./activities";

export interface LogActivityCommand {
  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export type CommandStatus = Success | Failure;

export class Success {
  readonly success = true;
}

export class Failure {
  readonly success = false;
  readonly errorMessage: string;

  constructor(errorMessage: string) {
    this.errorMessage = errorMessage;
  }
}

export interface RecentActivitiesQuery {
  readonly today?: string;
  readonly timeZone?: string;
}

export interface RecentActivitiesQueryResult {
  readonly lastActivity?: Activity;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly timeZone?: string;
}
