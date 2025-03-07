// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Activity, TimeSummary, WorkingDay } from "./activities";

export interface LogActivityCommand {
  readonly start: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export class CommandStatus {
  static success(): CommandStatus {
    return new CommandStatus(true);
  }

  static failure(errorMessage: string): CommandStatus {
    return new CommandStatus(false, errorMessage);
  }

  constructor(
    public readonly success: boolean,
    public readonly errorMessage?: string,
  ) {}
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
  readonly errorMessage?: string;
}
